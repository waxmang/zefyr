import { GET_PACKING_LISTS, GET_PACKING_LIST, EDIT_PACKING_LIST, DELETE_PACKING_LIST } from '../actions/types';

const initialState = {
	packingLists: null,
	packingList: null,
	loading: true,
	error: {}
};

export default function packingLists(state = initialState, action) {
	const { type, payload } = action;

	switch (type) {
		case GET_PACKING_LISTS:
			return {
				...state,
				packingLists: payload.packingLists,
				loading: false
			};
		case GET_PACKING_LIST:
			return {
				...state,
				packingList: payload.packingList,
				loading: false
			};
		default:
			return state;
	}
}
