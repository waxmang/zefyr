import axios from 'axios';

import { GET_PACKING_LISTS, GET_PACKING_LIST, EDIT_PACKING_LIST, DELETE_PACKING_LIST } from './types';

export const getPackingLists = () => async (dispatch) => {
	try {
		const res = await axios.get('/api/packing-lists');
		console.log(res);

		dispatch({
			type: GET_PACKING_LISTS,
			payload: {
				packingLists: res.data
			}
		});
	} catch (err) {
		console.log(err);
	}
};
