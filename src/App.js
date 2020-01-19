import React from 'react';
import Register from '../src/pages/register.js';
import Login from '../src/pages/login.js';
import {
	BrowserRouter as Router,
	Switch,
	Route,
	withRouter
} from 'react-router-dom';
import GroupPage from './pages/GroupPage';
import StatsPage from './pages/StatsPage';
import BetPage from './pages/BetPage';
import TopBar from './components/TopBar';
import BottomNav from './components/BottomNav';
import {withFirebase} from "./components/Firebase";

class App extends React.Component {
	render() {
		return (
			<Router>
				<TopBarWithRouter />
				<Switch>
					<Route key="home" exact path="/" component={GroupPageWithNav} />
					<Route key="register" exact path="/register" component={Register} />
					<Route key="login" exact path="/login" component={Login} />
					<Route key="stats" exact path="/tulokset" component={StatsPage} />
					<Route key="bet" exact path="/veikkaa" component={BetPage} />
				</Switch>
				<BottomNavWithRouter />
			</Router>
		);
	}
}
const TopBarWithRouter = withFirebase(withRouter(TopBar));
const BottomNavWithRouter = withRouter(BottomNav);
const GroupPageWithNav = withRouter(GroupPage);

export default App;
