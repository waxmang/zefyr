import axios from 'axios';

import {
  GET_PACKING_LISTS,
  GET_PACKING_LIST,
  EDIT_PACKING_LIST,
  DELETE_PACKING_LIST,
} from './types';

export const getPackingLists = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/packing-lists');

    dispatch({
      type: GET_PACKING_LISTS,
      payload: {
        packingLists: res.data,
      },
    });
  } catch (err) {
    console.log(err);
  }
};

export const getPackingList = (packingListId) => async (dispatch) => {
  try {
    const res = await axios.get(`/api/packing-lists/${packingListId}`);

    dispatch({
      type: GET_PACKING_LIST,
      payload: {
        packingList: res.data,
      },
    });
  } catch (err) {
    console.log(err);
  }
};
