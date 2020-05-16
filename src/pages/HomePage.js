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
import HeaderComponent from '../components/HeaderComponent';
import { withFirebase } from '../components/Firebase';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';

const HomePage = props => {
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		props.setTitle('EM-KISAVEIKKAUS');
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
	}, []);

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

const HeaderComponentFirebase = withFirebase(HeaderComponent);
const GroupListFirebase = withFirebase(GroupList);
const ScoreboardRouter = withRouter(Scoreboard);

export default connect(null, {
	setTitle,
	setMatches,
	setUserGroup,
	setUserUid
})(HomePage);
