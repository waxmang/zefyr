import React, { useRef, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRoute } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import filterObject from '../../utils/filterObject';

const MapComponentContainer = styled.div`
  margin: 0;
  padding: 0;
  position: fixed;
  min-height: 100vh;
  min-width: 100vw;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* z-index: 1; */
`;

const MapControlsContainer = styled.div`
  float: right;
  position: absolute;
  right: 0;
  z-index: 99999;
`;

const MapContainer = styled.div`
  height: 100vh;
  width: 100vw;
`;

mapboxgl.accessToken =
  'pk.eyJ1IjoibWF4d2FuZzA1MSIsImEiOiJja3J3a3g4Z24waG03MnZtaWthZGUwbzdvIn0.zHmuo1QvKneRY5nJy2TgAQ';

var LotsOfPointsMode = {};

// When the mode starts this function will be called.
// The `opts` argument comes from `draw.changeMode('lotsofpoints', {count:7})`.
// The value returned should be an object and will be passed to all other lifecycle functions
LotsOfPointsMode.onSetup = function (opts) {
  var state = {};
  state.count = opts.count || 0;
  return state;
};

// Whenever a user clicks on the map, Draw will call `onClick`
LotsOfPointsMode.onClick = async function (state, e) {
  // `this.newFeature` takes geojson and makes a DrawFeature

  var point = this.newFeature({
    type: 'Feature',
    properties: {
      count: state.count,
    },
    geometry: {
      type: 'Point',
      coordinates: [e.lngLat.lng, e.lngLat.lat],
    },
  });

  const features = this._ctx.store._features;

  if (Object.keys(features).length > 0) {
    const pointFeatures = filterObject(
      features,
      (feature) => feature.type === 'Point'
    );
    console.log(pointFeatures);
    const lastPointId = Object.keys(pointFeatures)[
      Object.keys(pointFeatures).length - 1
    ];
    const lastPoint = features[lastPointId];

    const coordinates = `${lastPoint.coordinates[0]},${lastPoint.coordinates[1]};${point.coordinates[0]},${point.coordinates[1]}`;

    const lineCoordinates = await getMatch(coordinates, [25, 25], 'walking');

    // Add new line feature to object here using coords
    const line = this.newFeature({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: lineCoordinates,
      },
    });
    this.addFeature(line);
  }

  this.addFeature(point); // puts the point on the map
};

// Whenever a user clicks on a key while focused on the map, it will be sent here
LotsOfPointsMode.onKeyUp = function (state, e) {
  if (e.keyCode === 27) return this.changeMode('simple_select');
};

// This is the only required function for a mode.
// It decides which features currently in Draw's data store will be rendered on the map.
// All features passed to `display` will be rendered, so you can pass multiple display features per internal feature.
// See `styling-draw` in `API.md` for advice on making display features
LotsOfPointsMode.toDisplayFeatures = function (state, geojson, display) {
  display(geojson);
};

// Make a Map Matching request
const getMatch = async (coordinates, radius, profile) => {
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
  const coords = await response.matchings[0].geometry.coordinates;
  // Code from the next step will go here
  console.log(coords);
  return coords;
};

const draw = new MapboxDraw({
  displayControlsDefault: false,
  controls: {
    line_string: true,
    trash: true,
  },
  styles: [
    // ACTIVE (being drawn)
    // line stroke
    {
      id: 'gl-draw-line',
      type: 'line',
      filter: ['all', ['==', '$type', 'LineString']],
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': '#3b9ddd',
        'line-dasharray': [0.2, 2],
        'line-width': 4,
        'line-opacity': 0.7,
      },
    },
    // vertex point halos
    {
      id: 'gl-draw-polygon-and-line-vertex-halo-active',
      type: 'circle',
      filter: ['all', ['==', '$type', 'Point']],
      paint: {
        'circle-radius': 6,
        'circle-color': '#558b70',
      },
    },
    // vertex points
    {
      id: 'gl-draw-polygon-and-line-vertex-active',
      type: 'circle',
      filter: [
        'all',
        ['==', 'meta', 'vertex'],
        ['==', '$type', 'Point'],
        ['!=', 'mode', 'static'],
      ],
      paint: {
        'circle-radius': 6,
        'circle-color': '#3b9ddd',
      },
    },
  ],
  defaultMode: 'lots_of_points',
  modes: Object.assign(
    {
      lots_of_points: LotsOfPointsMode,
    },
    MapboxDraw.modes
  ),
});

const Map = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-122.33);
  const [lat, setLat] = useState(47.6);
  const [zoom, setZoom] = useState(12);
  const [drawingRoute, setDrawingRoute] = useState(false);

  useEffect(() => {
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v11',
      center: [lng, lat],
      zoom: zoom,
    });
    map.current.on('idle', () => {
      map.current.resize();
    });

    map.current.addControl(draw);
  });

  useEffect(() => {
    if (!map.current) return;
    map.current.on('move', () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });

    map.current.on('draw.create', updateRoute);
    map.current.on('draw.update', updateRoute);
  });

  // Use the coordinates you drew to make the Map Matching API request
  const updateRoute = () => {
    // Set the profile
    const profile = 'walking';
    // Get the coordinates that were drawn on the map
    const data = draw.getAll();
    const lastFeature = data.features.length - 1;
    const coords = data.features[lastFeature].geometry.coordinates;
    // Format the coordinates
    const newCoords = coords.join(';');
    // Set the radius for each coordinate pair to 25 meters
    const radius = coords.map(() => 25);
    getMatch(newCoords, radius, profile);
  };

  // Make a Map Matching request
  const getMatch = async (coordinates, radius, profile) => {
    console.log(coordinates);
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
    console.log(response);
    // Get the coordinates from the response
    const coords = response.matchings[0].geometry;
    // Code from the next step will go here
    addRoute(coords);
  };

  const removeRoute = () => {
    if (map.current.getSource('route')) {
      map.current.removeLayer('route');
      map.current.removeSource('route');
      document.getElementById('calculated-line').innerHTML = '';
    } else {
      return;
    }
  };

  // Draw the Map Matching route as a new layer on the map
  const addRoute = (coords) => {
    // If a route is already loaded, remove it
    if (map.current.getSource('route')) {
      map.current.removeLayer('route');
      map.current.removeSource('route');
    } else {
      // Add a new layer to the map
      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: coords,
          },
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#03AA46',
          'line-width': 8,
          'line-opacity': 0.8,
        },
      });
    }
  };

  const onClickAddRoute = () => {
    setDrawingRoute(!drawingRoute);
    console.log(drawingRoute);
  };

  return (
    <MapComponentContainer>
      <div>
        <div className="sidebar">
          Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
        </div>
        {/* <MapControlsContainer>
          <Button onClick={onClickAddRoute}>
            <FontAwesomeIcon icon={faRoute} />
          </Button>
        </MapControlsContainer> */}
        <MapContainer ref={mapContainer} />
        <div id="calculated-line"></div>
      </div>
    </MapComponentContainer>
  );
};

export default Map;
