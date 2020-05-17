import React from 'react';
import { withFirebase } from './components/Firebase';
import { theme } from './utils/theme';
import AppRouter from './AppRouter';
import { Provider } from 'react-redux';
import store from './redux/store';
import { ThemeProvider } from '@material-ui/core/styles';

class App extends React.Component {
	render() {
		return (
			<ThemeProvider theme={theme}>
				<Provider store={store}>
					<AppWithRouter />
				</Provider>
			</ThemeProvider>
		);
	}
}

const AppWithRouter = withFirebase(AppRouter);
export default App;
