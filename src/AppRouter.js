import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
	setTitle,
	setMatches,
	setUserGroup,
	setUserUid,
	setLoadingState,
	getLoadingState,
	getUserData,
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
		//setLoadingState(true);
		props.firebase.auth.onAuthStateChanged(function (user) {
			setAuth(user);
			setLoading(false);
			if (user && !_.isEmpty(props.getUserData)) {
				console.log(props.getUserData);
				props.firebase
					.users()
					.doc(props.firebase.getCurrentUser().uid)
					.set(props.getUserData)
					.then(() => {
						Promise.all([
							props.firebase
								.users()
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
							console.log(results);
							const myUserGroup = _.pickBy(
								results[0],
								(user) =>
									user.userGroup ===
									results[0][props.firebase.getCurrentUser().uid].userGroup
							);
							myUserGroup[props.firebase.getCurrentUser().uid] =
								props.getUserData;
							console.log(myUserGroup);
							props.setUserUid(user.uid);
							props.setUserGroup(myUserGroup);
							props.setMatches(results[1]);
							setLoading(false);
						});
					});
			}
		});
	}, [props, props.getUserData]);

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
						<Route key="home" exact path="/" component={HomePageWithNav} />
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

const HomePageWithNav = withFirebase(withRouter(HomePage));
const TopBarWithRouter = withFirebase(withRouter(TopBar));

const mapStateToProps = (state) => {
	return {
		getLoadingState: getLoadingState(state),
		getUserData: getUserData(state),
	};
};

export default connect(mapStateToProps, {
	setTitle,
	setMatches,
	setUserGroup,
	setUserUid,
	setLoadingState,
})(AppRouter);
