import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import doubleClickZoom from '@mapbox/mapbox-gl-draw/src/lib/double_click_zoom';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

import getRouteMatch from '../utils/getRouteMatch';
import store from '../store';
import { SAVE_ROUTE } from '../actions/types';
import replaceCircular from '../utils/replaceCircular';

const DrawRoute = {};

// When the mode starts this function will be called.
// The `opts` argument comes from `draw.changeMode('lotsofpoints', {count:7})`.
// The value returned should be an object and will be passed to all other lifecycle functions
DrawRoute.onSetup = function (opts) {
  console.log(opts);
  var state = {
    route: {
      points: [],
      lines: [],
    },
  };
  doubleClickZoom.disable(this);
  return state;
};

// Whenever a user clicks on the map, Draw will call `onClick`
DrawRoute.onClick = function (state, e) {
  // `this.newFeature` takes geojson and makes a DrawFeature

  var point = this.newFeature({
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Point',
      coordinates: [e.lngLat.lng, e.lngLat.lat],
    },
  });

  if (state.route.points.length > 0) {
    const lastPoint = state.route.points[state.route.points.length - 1];

    const coordinates = `${lastPoint.coordinates[0]},${lastPoint.coordinates[1]};${point.coordinates[0]},${point.coordinates[1]}`;

    getRouteMatch(coordinates, [25, 25], 'walking').then((lineCoordinates) => {
      let line = null;
      if (!lineCoordinates) {
        console.log('No coordinates to get here');

        line = this.newFeature({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [lastPoint.coordinates, point.coordinates],
          },
        });
      } else {
        // Add new line feature to object here using coords
        line = this.newFeature({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: lineCoordinates,
          },
        });

        console.log(line.toGeoJSON());
      }
      state.route.lines.push(line);
      this.addFeature(line);
      this._ctx.store.render();
    });
  }
  state.route.points.push(point);
  this.addFeature(point);
};

DrawRoute.clickOnVertex = function (state) {
  console.log('clickOnVertex');
};

// Whenever a user clicks on a key while focused on the map, it will be sent here
DrawRoute.onStop = function (state) {
  doubleClickZoom.enable(this);
  console.log('Stopped drawing route');
  console.log(state.route);

  // const newPoints = state.route.points.map((point) => {
  //   const newPoint = { ...point };
  //   delete newPoint.ctx.store.ctx;
  //   return newPoint;
  // });

  // console.log(newPoints);

  // store.dispatch({
  //   type: SAVE_ROUTE,
  //   payload: JSON.parse(JSON.stringify(state.route)),
  // });
};

DrawRoute.onKeyUp = function (state, e) {
  if (e.keyCode === 27) return this.changeMode('simple_select');
};

DrawRoute.onTrash = function (state) {
  console.log('Trashed');
  state.route.points.forEach((point) => {
    this._ctx.api.delete([point.id]);
  });

  state.route.lines.forEach((line) => {
    this._ctx.api.delete([line.id]);
  });

  state.route = {
    points: [],
    lines: [],
  };
  this.changeMode('simple_select');
};

// This is the only required function for a mode.
// It decides which features currently in Draw's data store will be rendered on the map.
// All features passed to `display` will be rendered, so you can pass multiple display features per internal feature.
// See `styling-draw` in `API.md` for advice on making display features
DrawRoute.toDisplayFeatures = function (state, geojson, display) {
  display(geojson);
};

export default DrawRoute;
