import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
	setTitle,
	setMatches,
	setUserGroup,
	setUserUid,
	setLoadingState,
	getLoadingState,
	getUserUid,
	getGroupName,
} from './redux/actions';
import _ from 'lodash';
import Register from '../src/pages/register.js';
import Login from '../src/pages/login.js';
import {
	Switch,
	Route,
	Redirect,
	withRouter,
	BrowserRouter as Router,
} from 'react-router-dom';
import HomePage from './pages/HomePage';
import BetPage from './pages/BetPage';
import MatchScorePage from './pages/MatchScorePage';
import PlayerPage from './pages/PlayerPage';

import { withFirebase } from './components/Firebase';
import TopBar from './components/TopBar';
import { Grid, makeStyles } from '@material-ui/core/';
import Skeleton from '@material-ui/lab/Skeleton';

const useStyles = makeStyles((theme) => ({
	skeleton: {
		marginTop: 10,
		marginBottom: 10,
	},
}));

const AppRouter = (props) => {
	const classes = useStyles();
	const [userAuth, setAuth] = useState(false);
	const [loading, setLoading] = useState(true);

	// Check authentication
	useEffect(() => {
		props.firebase.auth.onAuthStateChanged(async (user) => {
			console.log('auth state changed');
			console.log(props.getGroupName, user);
			if (user) {
				props.firebase
					.users()
					.doc(user.uid)
					.get()
					.then((currentUser) => {
						fetchData({ ...currentUser.data(), uid: user.uid });
					})
					.catch(() => {
						if (props.getGroupName) {
							console.log('user: ', user);
							console.log(props.state);
							setLoading(true);
							fetchData(user);
						} else {
							setLoading(false);
						}
					});
			}
			setLoading(false);
			setAuth(user);
		});
	}, [props, props.getGroupName]);

	const fetchData = (currentUser) => {
		console.log(currentUser);
		Promise.all([
			props.firebase
				.users()
				.where(
					'userGroup',
					'==',
					currentUser.userGroup ? currentUser.userGroup : props.getGroupName
				)
				.get()
				.then((querySnapshot) => {
					return _.fromPairs(
						querySnapshot.docs.map((user) => [
							user.id,
							{ ...user.data(), id: user.id },
						])
					);
				}),
			props.firebase
				.matches()
				.get()
				.then((querySnapshot) => {
					return _.groupBy(
						querySnapshot.docs.map((item) => item.data()),
						(item) => item.group
					);
				}),
		]).then((results) => {
			console.log(results[0]);
			props.setUserUid(currentUser.uid);
			props.setUserGroup(results[0]);
			props.setMatches(results[1]);
			setLoading(false);
		});
	};

	// If user is not authenticated, she/he can only log in/register
	const authCheck = () => {
		if (!loading) {
			if (!userAuth) {
				return (
					<Switch key="notAuth">
						<Route key="register" exact path="/register" component={Register} />
						<Route key="login" exact path="/login" component={Login} />
						<Redirect to="/login" />
					</Switch>
				);
			} else {
				return (
					<Switch key="auth">
						<Route key="match" exact path="/matsi" component={MatchScorePage} />
						<Route key="bet" exact path="/veikkaa" component={BetPage} />
						<Route key="player" exact path="/pelaaja" component={PlayerPage} />
						<Route key="home" exact path="/" component={HomePageWithRouter} />
						<Redirect to="/" />
					</Switch>
				);
			}
		}
		return (
			<Grid container justify="center" className={classes.skeleton}>
				<Skeleton variant="text" height={50} width={300} animation="wave" />
				{_.range(10).map(() => (
					<Skeleton
						variant="rect"
						height={70}
						width="95%"
						className={classes.skeleton}
						animation="wave"
					/>
				))}
			</Grid>
		);
	};

	return (
		<Router>
			<TopBarWithRouter />
			{authCheck()}
		</Router>
	);
};

const HomePageWithRouter = withFirebase(withRouter(HomePage));
const TopBarWithRouter = withFirebase(withRouter(TopBar));

const mapStateToProps = (state) => {
	return {
		getUserUid: getUserUid(state),
		getGroupName: getGroupName(state),
	};
};

export default connect(mapStateToProps, {
	setTitle,
	setMatches,
	setUserGroup,
	setUserUid,
	setLoadingState,
})(AppRouter);
