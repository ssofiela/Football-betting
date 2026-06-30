import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import {
	setTitle,
	setMatches,
	setUserGroup,
	setUserUid,
	getMatches,
	getUserGroup,
} from '../redux/actions';
import { loadLeagueData } from '../utils/loadLeagueData';
import PointsBreakdown from '../components/PointsBreakdown';
import PointsChart from '../components/PointsChart';
import {
	CircularProgress,
	Grid,
	Paper,
	Typography,
	makeStyles,
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
	paper: {
		margin: 10,
		padding: 10,
	},
	title: {
		fontVariant: 'small-caps',
		textAlign: 'center',
		marginBottom: 8,
	},
	note: {
		marginTop: 8,
		color: '#888',
		textAlign: 'center',
	},
}));

const DetailedPointsPage = (props) => {
	const classes = useStyles();
	const hasData =
		!_.isEmpty(props.getMatches) && !_.isEmpty(props.getUserGroup);
	const [loading, setLoading] = useState(!hasData);

	useEffect(() => {
		props.setTitle('tilastot');
		if (hasData) return;
		loadLeagueData(props.firebase).then(({ users, matches }) => {
			props.setUserUid(props.firebase.getCurrentUser().uid);
			props.setUserGroup(users);
			props.setMatches(matches);
			setLoading(false);
		});
	}, [props, hasData]);

	if (loading) {
		return (
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
		);
	}

	return (
		<div>
			<Paper elevation={3} className={classes.paper}>
				<Typography variant="h6" className={classes.title}>
					Osumat
				</Typography>
				<PointsBreakdown />
			</Paper>
			<Paper elevation={3} className={classes.paper}>
				<Typography variant="h6" className={classes.title}>
					Pisteet otteluittain
				</Typography>
				<PointsChart />
				<Typography variant="caption" component="p" className={classes.note}>
					Loppuottelun pisteet lasketaan kaksinkertaisina kuvaajan
					loppusummissa.
				</Typography>
			</Paper>
		</div>
	);
};

const mapStateToProps = (state) => {
	return {
		getMatches: getMatches(state),
		getUserGroup: getUserGroup(state),
	};
};

export default connect(mapStateToProps, {
	setTitle,
	setMatches,
	setUserGroup,
	setUserUid,
})(DetailedPointsPage);
