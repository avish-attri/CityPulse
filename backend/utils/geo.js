// Distance in meters from km
const kmToMeters = (km) => km * 1000;

export const buildGeoQuery = (lng, lat, maxDistanceKm) => ({
  location: {
    $near: {
      $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
      $maxDistance: kmToMeters(maxDistanceKm),
    },
  },
});

const parseCoordinates = (body) => {
  const lng = parseFloat(body.longitude ?? body.lng);
  const lat = parseFloat(body.latitude ?? body.lat);
  if (isNaN(lng) || isNaN(lat)) return null;
  return [lng, lat];
};

const buildNominatimQuery = (body) => {
  const parts = [];
  if (body.address) parts.push(body.address);
  if (body.venue) parts.push(body.venue);
  if (body.area) parts.push(body.area);
  if (body.city) parts.push(body.city);
  return parts.filter(Boolean).join(', ');
};

const geocodeLocation = async (body) => {
  const query = buildNominatimQuery(body);
  if (!query) return null;

  const params = new URLSearchParams({
    q: query,
    format: 'json',
    addressdetails: '1',
    limit: '1',
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: {
      'User-Agent': 'CityPulse/1.0 (citypulse.local)',
      Accept: 'application/json',
    },
  });

  if (!response.ok) return null;
  const results = await response.json();
  const best = Array.isArray(results) && results[0];
  if (!best) return null;

  const lat = parseFloat(best.lat);
  const lon = parseFloat(best.lon);
  if (Number.isFinite(lat) && Number.isFinite(lon)) return [lon, lat];
  return null;
};

export const getLocationCoordinates = async (body, fallbackCity = '') => {
  const coords = parseCoordinates(body);
  if (coords) return coords;
  return geocodeLocation({ ...body, city: body.city || fallbackCity });
};

