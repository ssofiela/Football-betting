import React, { useState, useEffect } from 'react';

import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import GroupList from '../components/GroupList';
import Scoreboard from '../components/Scoreboard';
import HeaderComponent from '../components/HeaderComponent';
import { withFirebase } from '../components/Firebase';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';

const HomePage = props => {
	const [serverData, setServerData] = useState({});

	useEffect(() => {
		Promise.all([
			props.firebase
				.users()
				.get()
				.then(querySnapshot => {
					return _.fromPairs(
						querySnapshot.docs.map(user => [
							user.id,
							{ ...user.data(), id: user.id }
						])
					);
				}),
			props.firebase
				.matches()
				.get()
				.then(querySnapshot => {
					return _.groupBy(
						querySnapshot.docs.map(item => item.data()),
						item => item.group
					);
				})
		]).then(results => {
			setServerData({
				users: results[0],
				matches: results[1],
				currentUserUid: props.firebase.getCurrentUser().uid
			});
		});
	}, []);

	return (
		<div>
			{!_.isEmpty(serverData) ? (
				<div>
					<HeaderComponentFirebase />
					<ScoreboardRouter serverData={serverData} />
					<GroupList serverData={serverData} />
				</div>
			) : (
				<Grid container justify="center" alignItems="center">
					<Grid item>
						<CircularProgress color="secondary" />
					</Grid>
				</Grid>
			)}
		</div>
	);
};

const HeaderComponentFirebase = withFirebase(HeaderComponent);
const GroupListFirebase = withFirebase(GroupList);
const ScoreboardRouter = withRouter(Scoreboard);

export default HomePage;
