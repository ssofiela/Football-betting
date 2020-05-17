import { createStore } from 'redux';
import rootReducer from './reducers';
import throttle from 'lodash/throttle';
import { loadState, saveState } from '../utils/localStorage';

const persistedState = loadState();
console.log(persistedState);
const store = createStore(rootReducer, persistedState);

store.subscribe(
	throttle(() => {
		console.log(store.getState());
		saveState(store.getState());
	}, 1000)
);

export default store;
