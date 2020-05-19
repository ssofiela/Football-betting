import { SET_LOADING_STATE } from '../actionTypes';

const initialState = {
	loading: false,
};

export default function (state = initialState, action) {
	switch (action.type) {
		case SET_LOADING_STATE: {
			return {
				...state,
				loading: action.payload.loading,
			};
		}
		default:
			return state;
	}
}
