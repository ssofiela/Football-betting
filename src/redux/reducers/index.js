import { combineReducers } from 'redux';
import topbar from './topbar';
import matches from './matches';
import user from './user';

export default combineReducers({ topbar, matches, user });
