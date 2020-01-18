import React from 'react';
import Register from '../src/pages/register.js';
import {
	BrowserRouter as Router,
	Switch,
	Route,
	withRouter
} from 'react-router-dom';
import GroupPage from './pages/GroupPage';
import StatsPage from './pages/StatsPage';
import TopBar from './components/TopBar';

class App extends React.Component {
	render() {
		return (
			<Router>
				<TopBarNav />
				<Switch>
					<Route key="home" exact path="/" component={GroupPage} />
					<Route key="register" exact path="/register" component={Register} />
					<Route key="stats" exact path="/tulokset" component={StatsPage} />
				</Switch>
			</Router>
		);
	}
}

const TopBarNav = withRouter(TopBar);

export default App;
