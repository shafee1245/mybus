// ===============================
// MyBus - Customer Dashboard Logic (upgraded)
// Features:
// - initializes Google Map
// - shows user location
// - finds route-matching buses from Firebase
// - fetches driver live locations (users/driver/{phone}/location)
// - filters buses within 30 km (Haversine)
// - places clickable markers with InfoWindow (distance, ETA, arrival time)
// - list entries clickable to open marker and center map
// - cleans up old markers on new searches
// ===============================

let map;
let userMarker = null;
let busMarkers = {}; // keyed by driverPhone -> { marker, infoHtml }
let infoWindow;

// --- Initialize Google Map (called by Google Maps callback) ---
function initMap() {
  const defaultCenter = { lat: 12.9716, lng: 77.5946 }; // Bangalore fallback
  map = new google.maps.Map(document.getElementById("map"), {
    center: defaultCenter,
    zoom: 7,
  });
  infoWindow = new google.maps.InfoWindow();
}

// --- Utility: Haversine distance in km ---
function haversineDistance(coord1, coord2) {
  function toRad(x) { return (x * Math.PI) / 180; }
  const R = 6371; // Earth radius in km
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lng - coord1.lng);
  const lat1 = toRad(coord1.lat);
  const lat2 = toRad(coord2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// --- Utility: format minutes -> "X min" and arrival clock time -->
function formatEta(distKm, avgKmh = 40) {
  const etaHrs = distKm / avgKmh;
  const etaMins = Math.max(1, Math.round(etaHrs * 60));
  const arrival = new Date(Date.now() + etaMins * 60 * 1000);
  // Format HH:MM (local)
  const hh = arrival.getHours().toString().padStart(2, "0");
  const mm = arrival.getMinutes().toString().padStart(2, "0");
  return { etaMins, arrivalStr: `${hh}:${mm}` };
}

// --- Cleanup markers ---
function clearBusMarkers() {
  Object.values(busMarkers).forEach(entry => {
    if (entry.marker) entry.marker.setMap(null);
  });
  busMarkers = {};
}

// --- Center & open infowindow given driverPhone key ---
function openBusInfo(driverPhone) {
  const entry = busMarkers[driverPhone];
  if (!entry) return;
  map.setCenter(entry.marker.getPosition());
  map.setZoom(13);
  infoWindow.setContent(entry.infoHtml);
  infoWindow.open(map, entry.marker);
}

// --- DOM ready ---
document.addEventListener("DOMContentLoaded", () => {
  const customerForm = document.getElementById("customerForm");
  const fromInput = document.getElementById("fromInput");
  const toInput = document.getElementById("toInput");
  const messageEl = document.getElementById("customerMessage");
  const resultsSection = document.getElementById("resultsSection");
  const resultsList = document.getElementById("resultsList");

  if (!customerForm) {
    console.warn("customerForm not found");
    return;
  }

  customerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fromValue = fromInput.value.trim();
    const toValue = toInput.value.trim();

    if (!fromValue || !toValue) {
      messageEl.innerText = "⚠️ Please enter both From and To.";
      messageEl.style.color = "red";
      resultsSection.style.display = "none";
      return;
    }

    messageEl.innerText = "🔍 Searching for buses...";
    messageEl.style.color = "blue";

    // get user location first
    if (!navigator.geolocation) {
      messageEl.innerText = "❌ Geolocation not supported by this browser.";
      messageEl.style.color = "red";
      return;
    }

    // show browser prompt, then proceed
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };

        // show/update user marker
        if (userMarker) userMarker.setMap(null);
        userMarker = new google.maps.Marker({
          position: userPos,
          map,
          title: "You are here",
          icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
        });
        map.setCenter(userPos);
        map.setZoom(12);

        // fetch buses node
        const snap = await db.ref("buses").once("value");
        const buses = snap.val();

        // reset UI and markers
        resultsList.innerHTML = "";
        resultsSection.style.display = "none";
        clearBusMarkers();

        if (!buses) {
          messageEl.innerText = "❌ No buses registered yet.";
          messageEl.style.color = "red";
          return;
        }

        // We'll collect matching buses and then show results
        const matched = [];

        // iterate buses
        for (const [busId, bus] of Object.entries(buses)) {
          // ensure fields present
          const busFrom = (bus.from || "").toString().trim().toLowerCase();
          const busTo = (bus.to || "").toString().trim().toLowerCase();

          if (busFrom === fromValue.toLowerCase() && busTo === toValue.toLowerCase()) {
            // bus matches route — now fetch driver location (if any)
            let driverPhone = bus.driverPhone || bus.owner || null; // fallback if driver phone missing
            if (!driverPhone) {
              // still include bus in list but without location
              matched.push({ busId, bus, location: null });
              continue;
            }

            try {
              const locSnap = await db.ref(`users/driver/${driverPhone}/location`).once("value");
              const location = locSnap.exists() ? locSnap.val() : null;
              matched.push({ busId, bus, location, driverPhone });
            } catch (err) {
              console.warn("Failed to read driver location for", driverPhone, err);
              matched.push({ busId, bus, location: null, driverPhone });
            }
          }
        }

        // Now filter by distance and show markers + list
        let foundAny = false;
        for (const entry of matched) {
          const bus = entry.bus;
          const driverPhone = entry.driverPhone;
          if (entry.location && entry.location.latitude && entry.location.longitude) {
            const busPos = { lat: entry.location.latitude, lng: entry.location.longitude };
            const distKm = haversineDistance(userPos, busPos);

            // Only show if within 30 km
            if (distKm <= 30) {
              foundAny = true;

              // ETA
              const { etaMins, arrivalStr } = formatEta(distKm, 40);

              // create marker
              const marker = new google.maps.Marker({
                position: busPos,
                map,
                title: `${bus.vehicleName || "Bus"} (${bus.vehicleNumber || "N/A"})`,
                icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
              });

              // info html (safe small markup)
              const infoHtml = `
                <div style="font-size:14px;line-height:1.25">
                  <strong>${escapeHtml(bus.vehicleName || "Bus")}</strong> (${escapeHtml(bus.vehicleNumber || "N/A")})<br>
                  <small>Route: ${escapeHtml(bus.from || "-")} → ${escapeHtml(bus.to || "-")}</small><br>
                  <small>Distance: ${distKm.toFixed(1)} km</small><br>
                  <small>ETA: ${etaMins} min (arrives ~${arrivalStr})</small><br>
                </div>
              `;

              // store marker + info
              busMarkers[driverPhone] = { marker, infoHtml, busId };

              // marker click -> open info
              marker.addListener("click", () => {
                infoWindow.setContent(infoHtml);
                infoWindow.open(map, marker);
              });

              // add list item (clickable)
              const li = document.createElement("li");
              li.style.cursor = "pointer";
              li.innerHTML = `
                <strong>${bus.vehicleName || "Bus"}</strong> (${bus.vehicleNumber || "N/A"})<br>
                Distance: ${distKm.toFixed(1)} km — ETA: ${etaMins} min (≈ ${arrivalStr})
              `;
              li.addEventListener("click", () => {
                openBusInfo(driverPhone);
              });
              resultsList.appendChild(li);
            }
          } else {
            // No live location available for this bus — show as item (not clickable on map)
            const li = document.createElement("li");
            li.innerHTML = `
              <strong>${bus.vehicleName || "Bus"}</strong> (${bus.vehicleNumber || "N/A"})<br>
              Location: Not available (driver hasn't shared location)
            `;
            resultsList.appendChild(li);
          }
        }

        if (foundAny) {
          messageEl.innerText = "✅ Nearby buses within 30 km found.";
          messageEl.style.color = "green";
          resultsSection.style.display = "block";
        } else {
          messageEl.innerText = "❌ No nearby buses within 30 km for this route.";
          messageEl.style.color = "red";
          resultsSection.style.display = "none";
        }
      } catch (err) {
        console.error("Search error:", err);
        messageEl.innerText = "❌ Error searching buses. Open console for details.";
        messageEl.style.color = "red";
        resultsSection.style.display = "none";
      }
    }, (err) => {
      console.warn("Geolocation error:", err);
      messageEl.innerText = "❌ Location access denied or unavailable.";
      messageEl.style.color = "red";
    }, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  });
});

// --- Small helper to escape user content in InfoWindow (prevent injection) ---
function escapeHtml(str) {
  if (!str) return "";
  return str.toString()
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Expose initMap for Google Maps callback
window.initMap = initMap;