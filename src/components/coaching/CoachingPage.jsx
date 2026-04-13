// components/coaching/CoachingPage.jsx
// Coaching centers finder with interactive map
// Uses OpenStreetMap (Leaflet) + Overpass API — completely free
// Auto-detects location, shows map pins, distance calculator

import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

const BASE = "http://localhost:8000/api";

// fix leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// custom user location icon
const userIcon = L.divIcon({
  html: `<div style="background:#212529;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  className: ""
});

// coaching center icon
const centerIcon = (category) => L.divIcon({
  html: `<div style="background:${category.includes("JEE") ? "#dc3545" : category.includes("College") ? "#0d6efd" : "#28a745"
    };color:white;padding:4px 8px;border-radius:20px;font-size:11px;font-weight:bold;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.3)">
    ${category.includes("JEE") ? "🎯" : category.includes("College") ? "🏛️" : "📚"}
  </div>`,
  iconAnchor: [20, 16],
  className: ""
});

// map auto-center component
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom || 12);
  }, [center]);
  return null;
}

const CATEGORY_COLORS = {
  "🎯 JEE/NEET Coaching": "#dc3545",
  "🏛️ College": "#0d6efd",
  "🎓 University": "#6f42c1",
  "📚 School/Academy": "#28a745"
};

function CoachingPage() {
  const [searchInput, setSearchInput] = useState("");
  const [centers, setCenters] = useState([]);
  const [userCoords, setUserCoords] = useState(null);
  const [mapCenter, setMapCenter] = useState([17.385, 78.486]); // Hyderabad default
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [ntaCenters, setNtaCenters] = useState([]);


  // auto-detect on mount
  useEffect(() => {
    detectAndSearch();
  }, []);

  async function detectAndSearch() {
    setDetecting(true);
    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 })
      );
      const { latitude, longitude } = pos.coords;
      setUserCoords([latitude, longitude]);
      setMapCenter([latitude, longitude]);

      // reverse geocode
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        { headers: { "User-Agent": "Prism-ExamApp/1.0" } }
      );
      const addr = res.data.address;
      const city = addr.city || addr.town || addr.suburb || addr.county || "your area";
      setSearchInput(city);
      await searchByLocation(city, latitude, longitude);
    } catch {
      // silently fail — user can search manually
    } finally {
      setDetecting(false);
    }
  }

  async function searchByLocation(loc, lat, lon) {
    if (!loc?.trim()) return;
    setLoading(true);
    setError("");
    setSearched(true);
    setCenters([]);
    setNtaCenters(res.data.ntaCenters || []);


    try {
      const res = await axios.get(`${BASE}/coaching/search`, {
        params: { location: loc }
      });

      if (res.data.coords) {
        const { lat: cLat, lon: cLon } = res.data.coords;
        setMapCenter([cLat, cLon]);
        if (!lat) setUserCoords([cLat, cLon]);
      }

      const results = res.data.payload || [];
      // add distance from actual user coords if available
      if (userCoords || lat) {
        const uLat = lat || userCoords[0];
        const uLon = lon || userCoords[1];
        results.forEach(c => {
          const d = haversine(uLat, uLon, c.lat, c.lon);
          c.distanceFromUser = d;
          c.distanceFromUserStr = `${d} km from you`;
        });
        results.sort((a, b) => a.distanceFromUser - b.distanceFromUser);
      }

      setCenters(results);
      if (results.length === 0) setError("No centers found. Try searching a broader area.");
    } catch (err) {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dlat = (lat2 - lat1) * Math.PI / 180;
    const dlon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dlat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dlon / 2) ** 2;
    return Math.round(R * 2 * Math.asin(Math.sqrt(a)) * 10) / 10;
  }

  function openInGoogleMaps(center) {
    const q = encodeURIComponent(`${center.name} ${center.address}`);
    window.open(`https://www.google.com/maps/search/${q}`, "_blank");
  }

  function getDirections(center) {
    if (userCoords) {
      window.open(
        `https://www.google.com/maps/dir/${userCoords[0]},${userCoords[1]}/${center.lat},${center.lon}`,
        "_blank"
      );
    } else {
      openInGoogleMaps(center);
    }
  }

  const categories = ["All", ...new Set(centers.map(c => c.category))];
  const filtered = filter === "All" ? centers : centers.filter(c => c.category === filter);

  return (
    <div style={{ height: "calc(100vh - 60px)", display: "flex", flexDirection: "column" }}>

      {/* header */}
      <div className="p-3 bg-dark text-white d-flex align-items-center gap-3 flex-wrap">
        <h5 className="mb-0 fw-bold">📍 Coaching Centers</h5>

        {/* search bar */}
        <div className="d-flex gap-2 flex-grow-1" style={{ maxWidth: "500px" }}>
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search city or area..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && searchByLocation(searchInput)}
            style={{ borderRadius: "20px" }}
          />
          <button
            className="btn btn-sm btn-outline-light"
            onClick={detectAndSearch}
            disabled={detecting}
            title="Use my location"
            style={{ borderRadius: "20px", minWidth: "40px" }}
          >
            {detecting ? <span className="spinner-border spinner-border-sm" /> : "📍"}
          </button>
          <button
            className="btn btn-sm btn-light fw-semibold"
            onClick={() => searchByLocation(searchInput)}
            disabled={loading}
            style={{ borderRadius: "20px" }}
          >
            {loading ? <span className="spinner-border spinner-border-sm" /> : "Search"}
          </button>
        </div>

        {centers.length > 0 && (
          <span className="badge bg-light text-dark">
            {filtered.length} centers found
          </span>
        )}
      </div>

      {/* category filters */}
      {centers.length > 0 && (
        <div className="px-3 py-2 bg-white border-bottom d-flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              className={`btn btn-sm ${filter === cat ? "btn-dark" : "btn-outline-secondary"}`}
              style={{ borderRadius: "20px", fontSize: "0.8rem" }}
              onClick={() => setFilter(cat)}
            >
              {cat} {cat !== "All" && `(${centers.filter(c => c.category === cat).length})`}
            </button>
          ))}
        </div>
      )}

      {/* main content — map + list */}
      <div className="flex-grow-1 d-flex overflow-hidden">

        {/* left panel — list */}
        <div
          className="overflow-auto bg-white border-end"
          style={{ width: "360px", flexShrink: 0 }}
        >
          {/* states */}
          {detecting && (
            <div className="text-center p-4">
              <div className="spinner-border text-dark mb-2" />
              <p className="text-secondary small">Detecting your location...</p>
            </div>
          )}

          {loading && (
            <div className="text-center p-4">
              <div className="spinner-border text-dark mb-2" />
              <p className="text-secondary small">Searching coaching centers...</p>
            </div>
          )}

          {error && !loading && (
            <div className="p-3">
              <div className="alert alert-warning py-2 small">{error}</div>
            </div>
          )}

          {!loading && searched && filtered.length === 0 && !error && (
            <div className="text-center p-5">
              <div style={{ fontSize: "3rem" }}>🏫</div>
              <p className="text-secondary mt-2">No centers found for this filter.</p>
            </div>
          )}

          {/* center cards */}
          {filtered.map((center, i) => (
            <div
              key={i}
              className={`p-3 border-bottom ${selectedCenter?.name === center.name ? "bg-light" : ""}`}
              style={{ cursor: "pointer", transition: "background 0.15s" }}
              onClick={() => {
                setSelectedCenter(center);
                setMapCenter([center.lat, center.lon]);
              }}
              onMouseEnter={e => { if (selectedCenter?.name !== center.name) e.currentTarget.style.background = "#f8f9fa"; }}
              onMouseLeave={e => { if (selectedCenter?.name !== center.name) e.currentTarget.style.background = ""; }}
            >
              <div className="d-flex gap-3">
                {/* rank */}
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0 text-white"
                  style={{
                    width: "36px", height: "36px",
                    background: Object.values(CATEGORY_COLORS)[
                      categories.indexOf(center.category) % Object.keys(CATEGORY_COLORS).length
                    ] || "#212529",
                    fontSize: "0.8rem"
                  }}
                >
                  {i + 1}
                </div>

                <div className="flex-grow-1 overflow-hidden">
                  <div className="fw-semibold text-truncate" style={{ fontSize: "0.9rem" }}>
                    {center.name}
                  </div>
                  <div className="text-secondary small text-truncate">{center.address}</div>
                  <div className="d-flex gap-2 mt-1 flex-wrap">
                    <span
                      className="badge"
                      style={{
                        background: CATEGORY_COLORS[center.category] || "#6c757d",
                        fontSize: "0.65rem"
                      }}
                    >
                      {center.category}
                    </span>
                    <span className="badge bg-light text-dark" style={{ fontSize: "0.65rem" }}>
                      📏 {center.distanceFromUserStr || center.distanceStr}
                    </span>
                  </div>
                </div>
              </div>

              {/* action buttons — show on select */}
              {selectedCenter?.name === center.name && (
                <div className="d-flex gap-2 mt-2 ms-5">
                  <button
                    className="btn btn-sm btn-dark"
                    style={{ borderRadius: "20px", fontSize: "0.75rem" }}
                    onClick={e => { e.stopPropagation(); getDirections(center); }}
                  >
                    🗺️ Directions
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    style={{ borderRadius: "20px", fontSize: "0.75rem" }}
                    onClick={e => { e.stopPropagation(); openInGoogleMaps(center); }}
                  >
                    📍 Google Maps
                  </button>
                  {center.website && (
                    <button
                      className="btn btn-sm btn-outline-primary"
                      style={{ borderRadius: "20px", fontSize: "0.75rem" }}
                      onClick={e => { e.stopPropagation(); window.open(center.website, "_blank"); }}
                    >
                      🌐 Website
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* right panel — map */}
        <div className="flex-grow-1 position-relative">
          <MapContainer
            center={mapCenter}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController center={mapCenter} zoom={12} />

            {/* user location */}
            {userCoords && (
              <Marker position={userCoords} icon={userIcon}>
                <Popup><strong>You are here</strong></Popup>
              </Marker>
            )}

            {/* coaching centers */}
            {filtered.map((center, i) => (
              <Marker
                key={i}
                position={[center.lat, center.lon]}
                icon={centerIcon(center.category)}
                eventHandlers={{
                  click: () => {
                    setSelectedCenter(center);
                  }
                }}
              >
                <Popup>
                  <div style={{ minWidth: "200px" }}>
                    <strong>{center.name}</strong>
                    <p className="small text-secondary mb-1">{center.address}</p>
                    <p className="small mb-2">
                      📏 {center.distanceFromUserStr || center.distanceStr}
                    </p>
                    <div className="d-flex gap-1">
                      <button
                        className="btn btn-dark btn-sm"
                        style={{ fontSize: "0.7rem" }}
                        onClick={() => getDirections(center)}
                      >
                        Directions
                      </button>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        style={{ fontSize: "0.7rem" }}
                        onClick={() => openInGoogleMaps(center)}
                      >
                        Google Maps
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          {/* NTA Exam Centers section */}
          {ntaCenters.length > 0 && (
            <div>
              <div className="p-3 border-top border-bottom bg-light">
                <h6 className="fw-bold mb-0 small">🏛️ NTA Exam Centers (Past)</h6>
              </div>
              {ntaCenters.map((center, i) => (
                <div key={i} className="p-3 border-bottom d-flex align-items-start gap-2">
                  <span style={{ fontSize: "1.2rem" }}>🏛️</span>
                  <div>
                    <div className="fw-semibold small">{center.name}</div>
                    <div className="text-secondary" style={{ fontSize: "0.75rem" }}>{center.address}</div>
                    <span className="badge bg-warning text-dark mt-1" style={{ fontSize: "0.65rem" }}>
                      {center.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* map overlay info */}
          {!searched && !loading && !detecting && (
            <div
              className="position-absolute top-50 start-50 translate-middle text-center bg-white p-4 rounded shadow"
              style={{ zIndex: 1000, maxWidth: "300px" }}
            >
              <div style={{ fontSize: "3rem" }}>📍</div>
              <h6 className="fw-bold mt-2">Find Coaching Centers</h6>
              <p className="text-secondary small">
                Allow location access or search your city to find JEE/NEET coaching centers near you.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CoachingPage;