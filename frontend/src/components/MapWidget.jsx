import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Compass, Crosshair, Locate, AlertTriangle, Clock, DollarSign, Building2, Briefcase } from 'lucide-react';

// Fix Leaflet default marker icon path issue in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ─── Custom Icons ──────────────────────────────────────────────────────────────

const createUserIcon = () => L.divIcon({
  className: 'user-location-marker',
  html: `
    <div class="user-marker-container">
      <div class="user-marker-pulse"></div>
      <div class="user-marker-pulse user-marker-pulse-delay"></div>
      <div class="user-marker-dot"></div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const createJobIcon = (isEmergency) => L.divIcon({
  className: 'job-location-marker',
  html: `
    <div class="job-marker-container ${isEmergency ? 'job-marker-emergency' : 'job-marker-standard'}">
      <div class="job-marker-pin">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
      <div class="job-marker-shadow"></div>
    </div>
  `,
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -42],
});

// ─── Map Event Handler (Click to Relocate) ─────────────────────────────────────

function MapClickHandler({ onLocationChange }) {
  useMapEvents({
    click(e) {
      onLocationChange(
        parseFloat(e.latlng.lat.toFixed(6)),
        parseFloat(e.latlng.lng.toFixed(6))
      );
    },
  });
  return null;
}

// ─── Fly-To Controller (smoothly pans map when location changes) ────────────

function FlyToLocation({ lat, lng, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], zoom || map.getZoom(), { duration: 1.2 });
    }
  }, [lat, lng]);
  return null;
}

// ─── Main MapWidget Component ──────────────────────────────────────────────────

export default function MapWidget({ jobs, userLat, userLng, onLocationChange, maxDistance, setMaxDistance }) {
  const [geoStatus, setGeoStatus] = useState('idle'); // idle | loading | success | error | denied
  const [geoError, setGeoError] = useState('');
  const mapRef = useRef(null);
  const userIcon = useMemo(() => createUserIcon(), []);

  // Compute the radius circle in meters
  const radiusMeters = maxDistance * 1000;

  // Request browser geolocation with IP fallback
  const requestGeolocation = () => {
    setGeoStatus('loading');

    const fallbackToIP = async (reason) => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        if (data.latitude && data.longitude) {
          onLocationChange(
            parseFloat(data.latitude),
            parseFloat(data.longitude)
          );
          setGeoStatus('success');
          setGeoError(`${reason} Using network location instead.`);
        } else {
          throw new Error('Invalid IP data');
        }
      } catch (err) {
        setGeoStatus('error');
        setGeoError(`${reason} Failed to get network location.`);
      }
    };

    if (!navigator.geolocation) {
      fallbackToIP('Browser GPS not supported.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onLocationChange(
          parseFloat(latitude.toFixed(6)),
          parseFloat(longitude.toFixed(6))
        );
        setGeoStatus('success');
        setGeoError('');
      },
      (error) => {
        let reason = '';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reason = 'GPS permission denied.';
            break;
          case error.POSITION_UNAVAILABLE:
            reason = 'GPS unavailable.';
            break;
          case error.TIMEOUT:
            reason = 'GPS request timed out.';
            break;
          default:
            reason = 'GPS error.';
        }
        fallbackToIP(reason);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  // Auto-request geolocation on mount
  useEffect(() => {
    requestGeolocation();
  }, []);

  // Haversine distance for display
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  };

  return (
    <div className="map-widget-wrapper">
      {/* Header Bar */}
      <div className="map-widget-header">
        <div className="map-widget-title-section">
          <h3 className="map-widget-title">
            <Compass className="map-icon-spin" size={16} />
            <span>Live Proximity Map</span>
          </h3>
          <p className="map-widget-subtitle">
            {geoStatus === 'success' 
              ? 'Showing your real GPS location. Click map to reposition.'
              : geoStatus === 'loading'
              ? 'Acquiring GPS coordinates...'
              : 'Click map to set your location or use the locate button.'}
          </p>
        </div>

        {/* Controls Row */}
        <div className="map-widget-controls">
          {/* Locate Me Button */}
          <button
            onClick={requestGeolocation}
            className={`map-locate-btn ${geoStatus === 'loading' ? 'map-locate-loading' : ''}`}
            title="Detect my current location"
          >
            <Crosshair size={14} className={geoStatus === 'loading' ? 'map-icon-spin' : ''} />
            <span>{geoStatus === 'loading' ? 'Locating...' : 'Locate Me'}</span>
          </button>

          {/* Distance Slider */}
          <div className="map-distance-slider">
            <span className="map-distance-label">
              Radius: <strong>{maxDistance} km</strong>
            </span>
            <input
              type="range"
              min="2"
              max="30"
              value={maxDistance}
              onChange={(e) => setMaxDistance(parseInt(e.target.value))}
              className="map-range-input"
            />
          </div>
        </div>
      </div>

      {/* Coordinates Info Bar */}
      <div className="map-coords-bar">
        <div className="map-coords-group">
          <span className="map-coord-item">
            <Navigation size={12} className="map-coord-icon" />
            <span>Lat: <strong>{userLat.toFixed(4)}</strong></span>
          </span>
          <span className="map-coord-item">
            <Navigation size={12} className="map-coord-icon" />
            <span>Lng: <strong>{userLng.toFixed(4)}</strong></span>
          </span>
          <span className="map-coord-item map-coord-status">
            <span className={`map-status-dot ${
              geoStatus === 'success' ? 'map-status-live' :
              geoStatus === 'loading' ? 'map-status-pending' :
              'map-status-manual'
            }`}></span>
            <span>{geoStatus === 'success' ? 'GPS Live' : geoStatus === 'loading' ? 'Acquiring...' : 'Manual'}</span>
          </span>
        </div>
        <span className="map-coords-hint">Click map to reposition</span>
      </div>

      {/* Geo Error Banner */}
      {geoError && (
        <div className="map-error-banner">
          <AlertTriangle size={13} />
          <span>{geoError}</span>
        </div>
      )}

      {/* The Real Map */}
      <div className="map-container-wrapper">
        <MapContainer
          center={[userLat, userLng]}
          zoom={13}
          scrollWheelZoom={true}
          className="map-leaflet-container"
          ref={mapRef}
          zoomControl={false}
        >
          {/* OpenStreetMap Tile Layer – free, no API key required */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Fly to user when location changes */}
          <FlyToLocation lat={userLat} lng={userLng} zoom={13} />

          {/* Click handler */}
          <MapClickHandler onLocationChange={onLocationChange} />

          {/* Search Radius Circle */}
          <Circle
            center={[userLat, userLng]}
            radius={radiusMeters}
            pathOptions={{
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.06,
              weight: 1.5,
              dashArray: '6 4',
            }}
          />

          {/* User Location Marker */}
          <Marker position={[userLat, userLng]} icon={userIcon}>
            <Popup className="map-popup-user">
              <div className="map-popup-content map-popup-user-content">
                <div className="map-popup-user-badge">📍 Your Location</div>
                <p className="map-popup-coords">
                  {userLat.toFixed(6)}, {userLng.toFixed(6)}
                </p>
                <p className="map-popup-note">
                  {geoStatus === 'success' ? '🟢 Live GPS Position' : '🔵 Manually Set'}
                </p>
              </div>
            </Popup>
          </Marker>

          {/* Job Markers */}
          {jobs.map((job) => {
            const jobIcon = createJobIcon(job.emergency);
            const dist = job.distance || getDistance(userLat, userLng, job.latitude, job.longitude);

            return (
              <Marker
                key={job._id}
                position={[job.latitude, job.longitude]}
                icon={jobIcon}
              >
                <Popup className={`map-popup-job ${job.emergency ? 'map-popup-emergency' : ''}`}>
                  <div className="map-popup-content">
                    {/* Emergency Badge */}
                    {job.emergency && (
                      <div className="map-popup-emergency-badge">
                        ⚠️ EMERGENCY GIG
                      </div>
                    )}

                    {/* Job Title & Company */}
                    <h4 className="map-popup-job-title">{job.title}</h4>
                    <div className="map-popup-company">
                      <Building2 size={12} />
                      <span>{job.companyName}</span>
                    </div>

                    {/* Info Grid */}
                    <div className="map-popup-info-grid">
                      <div className="map-popup-info-item">
                        <DollarSign size={12} className="map-popup-icon-green" />
                        <span>${job.salary}/hr</span>
                      </div>
                      <div className="map-popup-info-item">
                        <Clock size={12} className="map-popup-icon-blue" />
                        <span>{job.duration} Days</span>
                      </div>
                      <div className="map-popup-info-item">
                        <MapPin size={12} className="map-popup-icon-purple" />
                        <span>{dist} km away</span>
                      </div>
                      <div className="map-popup-info-item">
                        <Briefcase size={12} className="map-popup-icon-amber" />
                        <span>{job.category}</span>
                      </div>
                    </div>

                    {/* Location Name */}
                    <div className="map-popup-location">
                      📍 {job.locationName}
                    </div>

                    {/* Skills Tags */}
                    {job.skillsRequired && job.skillsRequired.length > 0 && (
                      <div className="map-popup-skills">
                        {job.skillsRequired.slice(0, 3).map((skill, i) => (
                          <span key={i} className="map-popup-skill-tag">{skill}</span>
                        ))}
                        {job.skillsRequired.length > 3 && (
                          <span className="map-popup-skill-more">+{job.skillsRequired.length - 3}</span>
                        )}
                      </div>
                    )}

                    {/* Working Hours */}
                    <div className="map-popup-hours">
                      🕐 {job.workingHours}
                    </div>

                    {/* Geofence indicator */}
                    <div className="map-popup-geofence">
                      {parseFloat(dist) <= 0.5 
                        ? '🟢 Within 500m geofence — QR check-in available' 
                        : '🔴 Outside 500m geofence'}
                    </div>
                  </div>
                </Popup>

                {/* 500m Geofence circle for each job */}
                <Circle
                  center={[job.latitude, job.longitude]}
                  radius={500}
                  pathOptions={{
                    color: job.emergency ? '#f43f5e' : '#10b981',
                    fillColor: job.emergency ? '#f43f5e' : '#10b981',
                    fillOpacity: 0.04,
                    weight: 1,
                    dashArray: '4 3',
                  }}
                />
              </Marker>
            );
          })}
        </MapContainer>

        {/* Floating Legend */}
        <div className="map-floating-legend">
          <div className="map-legend-item">
            <span className="map-legend-dot map-legend-user"></span>
            <span>Your Location</span>
          </div>
          <div className="map-legend-item">
            <span className="map-legend-dot map-legend-standard"></span>
            <span>Standard Gig</span>
          </div>
          <div className="map-legend-item">
            <span className="map-legend-dot map-legend-emergency"></span>
            <span>Emergency Gig</span>
          </div>
          <div className="map-legend-item">
            <span className="map-legend-circle"></span>
            <span>500m Geofence</span>
          </div>
        </div>

        {/* Job Count Badge */}
        <div className="map-job-count-badge">
          <Briefcase size={12} />
          <span>{jobs.length} gigs in range</span>
        </div>
      </div>
    </div>
  );
}
