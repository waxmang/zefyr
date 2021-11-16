import axios from 'axios';

import {
  GET_CLOSET,
  CLOSET_ERROR,
  GET_CATEGORIES,
  CATEGORIES_ERROR,
} from './types';

// Get current user's closet
export const getCurrentCloset = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/closet');
    console.log(res);

    dispatch({
      type: GET_CLOSET,
      payload: res.data,
    });
  } catch (err) {
    console.log(err);
    dispatch({
      type: CLOSET_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

// Get current user's categories (along with items)
export const getCurrentUserCategories = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/categories');

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
