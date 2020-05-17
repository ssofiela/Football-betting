import { SET_MATCHES } from '../actionTypes';

const initialState = {};

export default function(state = initialState, action) {
	switch (action.type) {
		case SET_MATCHES: {
			return action.payload.matches;
		}
		default:
			return state;
	}
}
