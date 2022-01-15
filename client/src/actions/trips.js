import axios from 'axios';

import {
  GET_TRIPS,
  GET_TRIP,
  TRIPS_ERROR,
  EDIT_TRIP_LINKS,
  DELETE_TRIP,
} from './types';

// Get current user's closet
export const getUserTrips = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/trips');

    dispatch({
      type: GET_TRIPS,
      payload: res.data,
    });
  } catch (err) {
    console.log(err);
    dispatch({
      type: TRIPS_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

export const getUserTrip = (tripId) => async (dispatch) => {
  try {
    const res = await axios.get(`/api/trips/${tripId}`);
    const gpxFiles = {};

    for (const step of res.data.steps) {
      if (step.hasOwnProperty('gpxFilename') && step.gpxFilename !== null) {
        const res = await axios.get(
          `/api/trips/${tripId}/steps/${step._id}/gpx`
        );
        gpxFiles[step._id] = res.data.gpxFile;
      }
    }

    const payload = {
      trip: res.data,
      gpxFiles: gpxFiles,
    };

    dispatch({
      type: GET_TRIP,
      payload: payload,
    });
  } catch (err) {
    console.log(err);
    dispatch({
      type: TRIPS_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

export const deleteUserTrip = (tripId) => async (dispatch) => {
  try {
    await axios.delete(`/api/trips/${tripId}`);
    dispatch({
      type: DELETE_TRIP,
      payload: {
        tripId: tripId,
      },
    });
  } catch (err) {
    console.log(err);
  }
};

export const editLinks = (tripId, newLinks) => async (dispatch) => {
  const payload = {
    links: newLinks,
  };

  dispatch({
    type: EDIT_TRIP_LINKS,
    payload: payload,
  });

  await axios.put(`/api/trips/${tripId}`, { links: newLinks });
};
