import axios from 'axios';

import { GET_TRIPS, GET_TRIP, TRIPS_ERROR } from './types';

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

    // res.data.steps.forEach(async (step) => {
    //   if (step.hasOwnProperty('gpxFilename') && step.gpxFilename !== null) {
    //     console.log('getting gpx');
    //     const res = await axios.get(
    //       `/api/trips/${tripId}/steps/${step._id}/gpx`
    //     );
    //     console.log(res);

    //     gpxFiles[step._id] = res.data.gpxFile;
    //   }
    // });

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

    console.log(payload);

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