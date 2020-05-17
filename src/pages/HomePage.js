import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
	setTitle,
	setMatches,
	setUserGroup,
	setUserUid
} from '../redux/actions';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import GroupList from '../components/GroupList';
import Scoreboard from '../components/Scoreboard';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import data from './../data/matches.json';

const HomePage = props => {
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		props.setTitle('em-kisaveikkaus');
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
			props.setUserUid(props.firebase.getCurrentUser().uid);
			props.setUserGroup(
				_.pickBy(
					results[0],
					user =>
						user.userGroup ===
						results[0][props.firebase.getCurrentUser().uid].userGroup
				)
			);
			props.setMatches(results[1]);
			setLoading(false);
		});
		//writeDB();
	}, []);

	const writeDB = () => {
		for (let i = 0; i < data.matches.length; i++) {
			props.firebase
				.matches()
				.doc(i.toString())
				.set(data.matches[i]);
		}
	};

	return (
		<div>
			{loading ? (
				<Grid container justify="center" alignItems="center">
					<Grid item>
						<CircularProgress color="secondary" />
					</Grid>
				</Grid>
			) : (
				<div>
					<ScoreboardRouter />
					<GroupList />
				</div>
			)}
		</div>
	);
};

const ScoreboardRouter = withRouter(Scoreboard);

export default connect(null, {
	setTitle,
	setMatches,
	setUserGroup,
	setUserUid
})(HomePage);
