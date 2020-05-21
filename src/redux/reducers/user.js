import { SET_USER_GROUP, SET_GROUP_NAME, SET_USER_UID } from '../actionTypes';

const initialState = {
	group: {},
	uid: '',
	groupName: '',
};

export default function (state = initialState, action) {
	switch (action.type) {
		case SET_USER_GROUP: {
			return {
				...state,
				group: action.payload.userGroup,
			};
		}
		case SET_GROUP_NAME: {
			return {
				...state,
				groupName: action.payload.groupName,
			};
		}
		case SET_USER_UID: {
			return {
				...state,
				uid: action.payload.uid,
			};
		}
		default:
			return state;
	}
}
