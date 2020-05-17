import { createStore } from 'redux';
import rootReducer from './reducers';
import throttle from 'lodash/throttle';
import { loadState, saveState } from '../utils/localStorage';

const persistedState = loadState();
const store = createStore(rootReducer, persistedState);

store.subscribe(
	throttle(() => {
		saveState(store.getState());
	}, 1000)
);

export default store;
