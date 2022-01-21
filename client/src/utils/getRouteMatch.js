import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken =
  'pk.eyJ1IjoibWF4d2FuZzA1MSIsImEiOiJja3J3a3g4Z24waG03MnZtaWthZGUwbzdvIn0.zHmuo1QvKneRY5nJy2TgAQ';

// Make a Map Matching request
const getRouteMatch = async (coordinates, radius, profile) => {
  // Separate the radiuses with semicolons
  const radiuses = radius.join(';');
  // Create the query
  const query = await fetch(
    `https://api.mapbox.com/matching/v5/mapbox/${profile}/${coordinates}?geometries=geojson&radiuses=${radiuses}&steps=true&access_token=${mapboxgl.accessToken}`,
    { method: 'GET' }
  );
  const response = await query.json();
  // Handle errors
  if (response.code !== 'Ok') {
    return;
  }
  // Get the coordinates from the response
  const coords = response.matchings[0].geometry.coordinates;
  // Code from the next step will go here
  return coords;
};

export default getRouteMatch;
