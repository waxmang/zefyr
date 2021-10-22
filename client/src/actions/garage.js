import axios from 'axios';

import {
  GET_GARAGE,
  GARAGE_ERROR,
  GET_CATEGORIES,
  CATEGORIES_ERROR,
} from './types';

// Get current user's garage
export const getCurrentGarage = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/garage');
    console.log(res);

    dispatch({
      type: GET_GARAGE,
      payload: res.data,
    });
  } catch (err) {
    console.log(err);
    dispatch({
      type: GARAGE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

// Get current user's categories (along with items)
export const getCurrentUserCategories = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/category');

    dispatch({
      type: GET_CATEGORIES,
      payload: res.data,
    });
  } catch (err) {
    dispatch({
      type: CATEGORIES_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};
