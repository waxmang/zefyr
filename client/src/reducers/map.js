import { SAVE_ROUTE, EDIT_CURRENT_ROUTE, SELECT_ROUTE } from '../actions/types';

const initialState = {
  routes: [],
  currentRoute: null,
};

export default function profile(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case SELECT_ROUTE:
      // Given a point ID, set a route as currentRoute
      const pointId = payload.pointId;

      state.routes.forEach((route) => {
        const points = route.points.filter((point) => {
          return point.id === pointId;
        });

        if (points.length > 0) {
          return { ...state, currentRoute: route };
        }
      });

      return state;
    case SAVE_ROUTE:
      // const newRoutes = [...state.routes, payload.route];
      return state;
    default:
      return state;
  }
}
