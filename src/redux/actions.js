import { SET_TITLE } from './actionTypes';

export const setTitle = title => ({
	type: SET_TITLE,
	payload: {
		title: title
	}
});

export const getTitle = store => store.topbar.title;
