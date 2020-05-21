import {
	SET_TITLE,
	SET_MATCHES,
	SET_USER_GROUP,
	SET_USER_UID
} from './actionTypes';

export const setTitle = title => ({
	type: SET_TITLE,
	payload: {
		title
	}
});

export const setMatches = matches => ({
	type: SET_MATCHES,
	payload: {
		matches
	}
});

export const setUserGroup = userGroup => ({
	type: SET_USER_GROUP,
	payload: {
		userGroup
	}
});

export const setUserUid = uid => ({
	type: SET_USER_UID,
	payload: {
		uid
	}
});

export const getTitle = store => store.topbar.title;
export const getMatches = store => store.matches;
export const getUserGroup = store => store.user.group;
export const getUserUid = store => store.user.uid;
