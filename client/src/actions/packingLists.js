import axios from 'axios';

import {
  GET_PACKING_LISTS,
  GET_PACKING_LIST,
  EDIT_PACKING_LIST,
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

export const togglePackingListItem = (packingList, itemToToggle) => async (
  dispatch
) => {
  const items = [...packingList.items];

  // Check if item is already in items. If not, append. If so, remove
  const itemFound = items.find((item) => item._id === itemToToggle._id);
  if (itemFound === undefined) {
    items.push(itemToToggle);
  } else {
    items.splice(items.indexOf(itemFound), 1);
  }

  const newPackingList = { ...packingList, items: items };

  dispatch({
    type: EDIT_PACKING_LIST,
    payload: {
      packingList: newPackingList,
    },
  });
};

export const toggleAllPackingListItems = (
  packingList,
  allItems,
  allItemsChecked
) => async (dispatch) => {
  let newItems = [];
  if (!allItemsChecked) {
    newItems = [...allItems];
  }

  const newPackingList = { ...packingList, items: newItems };

  dispatch({
    type: EDIT_PACKING_LIST,
    payload: {
      packingList: newPackingList,
    },
  });
};
