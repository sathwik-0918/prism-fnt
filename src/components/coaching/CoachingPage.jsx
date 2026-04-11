// components/coaching/CoachingPage.jsx
// Finds nearby JEE/NEET coaching centers
// Uses OpenStreetMap Nominatim + Overpass API — completely FREE, no limits

import { useState } from "react";
import axios from "axios";

const BASE = "http://localhost:8000/api";

function CoachingPage() {
  const [location, setLocation] = useState("");
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  async function detectLocation() {
    setDetecting(true);
    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      );
      const { latitude, longitude } = pos.coords;
      // reverse geocode
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
      );
      const addr = res.data.address;
      const city = addr.city || addr.town || addr.village || addr.county || "";
      setLocation(city);
    } catch (err) {
      setError("Could not detect location. Please type your city.");
    } finally {
      setDetecting(false);
    }
  }

  async function searchCenters() {
    if (!location.trim()) return;
    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const res = await axios.get(`${BASE}/coaching/search`, {
        params: { location: location.trim() }
      });
      setCenters(res.data.payload || []);
    } catch (err) {
      setError("Failed to find centers. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function openMaps(center) {
    const query = encodeURIComponent(`${center.name} ${center.address}`);
    window.open(`https://www.google.com/maps/search/${query}`, "_blank");
  }

  return (
    <div className="container py-4" style={{ maxWidth: "900px" }}>
      <div className="mb-4">
        <h3 className="fw-bold">📍 Coaching Centers Near You</h3>
        <p className="text-secondary">
          Find JEE and NEET coaching centers in your area using OpenStreetMap.
          100% free, no API key needed.
        </p>
      </div>

      {/* search */}
      <div className="card shadow p-4 mb-4">
        <div className="row g-3">
          <div className="col-md-8">
            <label className="form-label fw-semibold">Your City / Area</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Hyderabad, Kota, Delhi..."
              value={location}
              onChange={e => setLocation(e.target.value)}
              onKeyDown={e => e.key === "Enter" && searchCenters()}
            />
          </div>
          <div className="col-md-4 d-flex align-items-end gap-2">
            <button
              className="btn btn-outline-secondary flex-shrink-0"
              onClick={detectLocation}
              disabled={detecting}
              title="Detect my location"
            >
              {detecting ? <span className="spinner-border spinner-border-sm"/> : "📍"}
            </button>
            <button
              className="btn btn-dark w-100"
              onClick={searchCenters}
              disabled={loading || !location.trim()}
            >
              {loading ? <span className="spinner-border spinner-border-sm"/> : "Search"}
            </button>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-warning">{error}</div>}

      {searched && !loading && centers.length === 0 && (
        <div className="text-center py-5">
          <div style={{ fontSize: "3rem" }}>🏫</div>
          <p className="text-secondary mt-2">
            No coaching centers found in "{location}".
            Try a nearby city or broader area name.
          </p>
        </div>
      )}

      {/* results */}
      <div className="row g-3">
        {centers.map((center, i) => (
          <div key={i} className="col-12">
            <div className="card shadow p-4 d-flex flex-row align-items-start gap-3">
              <div
                className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                style={{ width: "44px", height: "44px" }}
              >
                {i + 1}
              </div>
              <div className="flex-grow-1">
                <h6 className="fw-bold mb-1">{center.name}</h6>
                <p className="text-secondary small mb-2">{center.address}</p>
                {center.distance && (
                  <span className="badge bg-light text-dark me-2">
                    📏 {center.distance}
                  </span>
                )}
                {center.type && (
                  <span className="badge bg-secondary">{center.type}</span>
                )}
              </div>
              <button
                className="btn btn-sm btn-outline-dark flex-shrink-0"
                onClick={() => openMaps(center)}
              >
                Maps →
              </button>
            </div>
          </div>
        ))}
      </div>

      {centers.length > 0 && (
        <div className="alert alert-info mt-4">
          <strong>ℹ️</strong> Data from OpenStreetMap. Click "Maps →" to open in Google Maps for navigation, reviews, and more details.
        </div>
      )}
    </div>
  );
}

export default CoachingPage;