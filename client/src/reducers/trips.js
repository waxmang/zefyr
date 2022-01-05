import {
  GET_TRIPS,
  GET_TRIP,
  TRIPS_ERROR,
  CLEAR_TRIPS,
  EDIT_TRIP,
  DELETE_TRIP,
  EDIT_STEP,
  DELETE_STEP,
  EDIT_TRIP_LINKS,
} from '../actions/types';

const initialState = {
  trips: null,
  trip: null,
  gpxFiles: null,
  loading: true,
  error: {},
};

export default function trips(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_TRIPS:
      return {
        ...state,
        trips: payload,
        loading: false,
      };
    case GET_TRIP:
      return {
        ...state,
        trip: payload.trip,
        gpxFiles: payload.gpxFiles,
        loading: false,
      };
    case TRIPS_ERROR:
      return {
        ...state,
        error: payload,
        loading: false,
      };
    case CLEAR_TRIPS:
      return {
        ...state,
        trips: null,
        loading: false,
      };
    case EDIT_TRIP: {
      return { ...state, trip: payload.trip };
    }
    case EDIT_TRIP_LINKS: {
      const newTrip = { ...state.trip, links: payload.links };
      return { ...state, trip: newTrip };
    }
    case DELETE_TRIP: {
      const trip = state.trips.find((trip) => trip._id === payload.tripId);
      const newTrips = [...state.trips];
      newTrips.splice(newTrips.indexOf(trip), 1);

      return { ...state, trips: newTrips };
    }
    case EDIT_STEP: {
      const newSteps = [...state.trip.steps];
      const index = newSteps.indexOf(
        newSteps.find((step) => step._id === payload.step._id)
      );

      newSteps.splice(index, 1, payload.step);

      const newTrip = { ...state.trip, steps: newSteps };

      return { ...state, trip: newTrip };
    }
    default:
      return state;
  }
}
