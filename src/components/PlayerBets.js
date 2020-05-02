import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import _ from 'lodash';

const MacthScore = props => {
	const styles = useStyles();
	const [currentUser, setCurrentUser] = React.useState('');
	const [userData, setUserData] = React.useState([]);
	const [matches, setMatches] = React.useState([]);

	// Find group members
	useEffect(() => {
		const currentUser = props.firebase.getCurrentUser().uid;
		setCurrentUser(currentUser);

		const fetchMatches = async () => {
			await props.firebase
				.matches()
				.get()
				.then(querySnapshot => {
					setMatches(
						_.groupBy(
							querySnapshot.docs.map(item => item.data()),
							item => item.group
						)
					);
				});
		};
		fetchMatches();
		console.log(props.props.location);
		const fetchUserData = async () => {
			await props.firebase
				.users()
				.get()
				.then(users => {
					setUserData(
						_.find(
							users.docs,
							user => user.id == props.props.location.state.user.id
						).data()
					);
				});
		};
		fetchUserData();
	}, []);

	// TODO: Use real names
	const listBets = () => {
		const betsJSX = [];
		_.toPairs(_.pick(userData, ['A', 'B', 'C', 'D', 'E', 'F'])).forEach(
			group => {
				betsJSX.push('Lohko ' + group[0]);
				matches[group[0]].forEach((match, index) => {
					console.log(match);
					betsJSX.push(
						<Paper
							key={`paper_${match.id}`}
							elevation={3}
							className={styles.groupContainer}
						>
							<Grid container xs direction="row" key={`grid_${match.id}`}>
								<Grid item xs className={styles.center}>
									<a>{match.away}</a>
								</Grid>
								<Grid item xs={2} className={styles.center}>
									<Box width={1 / 4}>
										<p>{group[1][index * 2]}</p>
									</Box>
								</Grid>
								<Grid item xs={2} className={styles.center}>
									<Box fontWeight="fontWeightMedium" fontSize={20}>
										-
									</Box>
								</Grid>
								<Grid item xs={2} className={styles.center}>
									<Box width={1 / 4}>
										<p>{group[1][index * 2 + 1]}</p>
									</Box>
								</Grid>
								<Grid item xs className={styles.center}>
									<a>{match.home}</a>
								</Grid>
							</Grid>
						</Paper>
					);
				});
			}
		);
		return betsJSX;
	};

	return (
		<div>
			<div key={'listGroups'}>{listBets()}</div>
		</div>
	);
};

const useStyles = makeStyles(theme => ({
	groupContainer: { margin: '20px' },
	root: {
		'& .MuiTextField-root': {
			maxWidth: 100
		}
	},
	submit: {
		margin: theme.spacing(3, 0, 2)
	},
	center: {
		display: 'flex',
		margin: '10px',
		textAlign: 'center',
		alignItems: 'center',
		justifyContent: 'center'
	}
}));

export default MacthScore;
