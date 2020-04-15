import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import _ from 'lodash';

const MacthScore = state => {
	const styles = useStyles();
	const [groupMembers, setGroupMembers] = React.useState('');
	const [currentUser, setCurrentUser] = React.useState('');
	const [groupBets, setGroupBets] = React.useState([]);

	// Find group members
	useEffect(() => {
		const currentUser = state.firebase.getCurrentUser().uid;
		setCurrentUser(currentUser);
		console.log('current', currentUser);
		const findGroupMembers = async () => {
			let groups = await state.firebase
				.userGroups()
				.get()
				.then(querySnapshot => {
					return _.groupBy(querySnapshot.docs, item => item.data().userIds);
				});
			const list = groups;
			for (let i = 0; i < Object.keys(list).length; i++) {
				const newList = Object.keys(list)[i].split(',');
				if (newList.includes(currentUser)) {
					setGroupMembers(newList);
				}
			}
		};
		findGroupMembers();

		const fetchGroupBets = async () => {
			await state.firebase
				.users()
				.get()
				.then(users => {
					const groupName = _.find(
						users.docs,
						item => item.id === currentUser
					).data().userGroup;
					const userGroup = _.filter(
						users.docs,
						item => item.data().userGroup === groupName
					);
					setGroupBets(
						_.map(
							userGroup,
							item => item.data()[state.state.location.state.groupChar]
						)
					);
				});
		};
		fetchGroupBets();
	}, []);

	// TODO: Use real names
	const listGroups = () => {
		const groupJSX = [];
		for (let j = 0; j < groupMembers.length; j++) {
			if (groupMembers[j] === currentUser) {
				groupJSX.push(<p key={j}>Minä</p>);
			} else {
				groupJSX.push(<p key={j}>NAME</p>);
			}
			for (let i = 0; i < state.state.location.state.matches.length; i++) {
				groupJSX.push(
					<Paper
						key={`paper${j}${i}`}
						elevation={3}
						className={styles.groupContainer}
					>
						<form className={styles.root} noValidate autoComplete="off">
							<Grid container xs direction="row" key={`grid${j}${i}`}>
								<Grid item xs className={styles.center}>
									<a>{state.state.location.state.matches[i].away}</a>
								</Grid>
								<Grid item xs={2} className={styles.center}>
									<Box width={1 / 4}>
										<p>{groupBets[j][i * 2]}</p>
									</Box>
								</Grid>
								<Grid item xs={2} className={styles.center}>
									<Box fontWeight="fontWeightMedium" fontSize={20}>
										-
									</Box>
								</Grid>
								<Grid item xs={2} className={styles.center}>
									<Box width={1 / 4}>
										<p>{groupBets[j][i * 2 + 1]}</p>
									</Box>
								</Grid>
								<Grid item xs className={styles.center}>
									<a>{state.state.location.state.matches[i].home}</a>
								</Grid>
							</Grid>
						</form>
					</Paper>
				);
			}
		}
		return groupJSX;
	};

	return (
		<div>
			<div key={'listGroups'}>{!_.isEmpty(groupBets) && listGroups()}</div>
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
