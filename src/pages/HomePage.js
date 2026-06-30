import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
	setTitle,
	setMatches,
	setUserGroup,
	setUserUid,
} from '../redux/actions';
import { CircularProgress, Grid } from '@material-ui/core/';
import GroupList from '../components/GroupList';
import Scoreboard from '../components/Scoreboard';
import { withRouter } from 'react-router-dom';
import { loadLeagueData } from '../utils/loadLeagueData';
import data from './../data/matches.json';

const HomePage = (props) => {
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		props.setTitle('em-kisaveikkaus');
		loadLeagueData(props.firebase).then(({ users, matches }) => {
			props.setUserUid(props.firebase.getCurrentUser().uid);
			props.setUserGroup(users);
			props.setMatches(matches);
			setLoading(false);
		});
		//writeDB();
	}, [props]);

	const writeDB = () => {
		for (let i = 0; i < data.matches.length; i++) {
			props.firebase.matches().doc(i.toString()).set(data.matches[i]);
		}
	};

	return (
		<div>
			{loading ? (
				<Grid
					container
					justifyContent="center"
					alignItems="center"
					style={{ marginTop: 200 }}
				>
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
	setUserUid,
})(HomePage);
