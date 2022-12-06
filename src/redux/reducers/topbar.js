import { SET_TITLE } from '../actionTypes';

const initialState = {
	title: 'MM-KISAVEIKKAUS'
};

export default function(state = initialState, action) {
	switch (action.type) {
		case SET_TITLE: {
			return {
				...state,
				title: action.payload.title
			};
		}
		default:
			return state;
	}
}
