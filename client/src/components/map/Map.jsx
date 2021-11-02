import React, { useRef, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRoute } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import doubleClickZoom from '@mapbox/mapbox-gl-draw/src/lib/double_click_zoom';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

import filterObject from '../../utils/filterObject';
import extendDrawBar from '../../utils/extendDrawBar';
import DrawRoute from '../../draw/DrawRoute';

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
  height: 80vh;
  width: 100vw;
`;

// TODO: Create a private route that calls Mapbox API so we don't need this accessToken here
mapboxgl.accessToken =
  'pk.eyJ1IjoibWF4d2FuZzA1MSIsImEiOiJja3J3a3g4Z24waG03MnZtaWthZGUwbzdvIn0.zHmuo1QvKneRY5nJy2TgAQ';

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
  // defaultMode: 'draw_route',
  modes: Object.assign(
    {
      draw_route: DrawRoute,
    },
    MapboxDraw.modes
  ),
});

const enableDrawRouteMode = () => {
  draw.changeMode('draw_route');
};
const drawBar = new extendDrawBar({
  draw: draw,
  buttons: [
    {
      on: 'click',
      action: enableDrawRouteMode,
      classes: [],
      content: '<span><i class="fas fa-route"></i></span>',
    },
  ],
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

    map.current.addControl(drawBar);
  });

  useEffect(() => {
    if (!map.current) return;
    map.current.on('move', () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
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

  const saveRoute = () => {
    console.log(draw.getAll());
  };

  return (
    <MapComponentContainer>
      <div>
        {/* <MapControlsContainer>
          <Button onClick={onClickAddRoute}>
            <FontAwesomeIcon icon={faRoute} />
          </Button>
        </MapControlsContainer> */}
        <MapContainer ref={mapContainer} />
        <div style={{ position: 'absolute', right: 0 }}>
          <Button onClick={saveRoute}>save</Button>
        </div>
      </div>
    </MapComponentContainer>
  );
};

export default Map;
