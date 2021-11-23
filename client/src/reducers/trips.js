import {
  GET_TRIPS,
  GET_TRIP,
  TRIPS_ERROR,
  CLEAR_TRIPS,
  DELETE_TRIP,
  EDIT_STEP,
  DELETE_STEP,
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
    case DELETE_TRIP: {
      const category = state.categories.find(
        (category) => category._id === payload.item.category
      );

      const newItems = [...category.items];
      newItems.splice(newItems.indexOf(payload.item), 1);

      const newCategory = { ...category, items: newItems };
      const newCategories = [...state.categories];
      newCategories.splice(newCategories.indexOf(category), 1, newCategory);

      return { ...state, categories: newCategories };
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
