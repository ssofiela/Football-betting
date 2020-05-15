import React, { useEffect } from 'react';
import { makeStyles, Typography } from '@material-ui/core';
import _ from 'lodash';
import { getFlag } from '../utils/utils';
import Card from './Card';

const MacthScore = state => {
	const styles = useStyles();
	const [groupMembers, setGroupMembers] = React.useState([]);
	const [currentUser, setCurrentUser] = React.useState('');
	const [groupBets, setGroupBets] = React.useState([]);
	const [groupNames, setGroupNames] = React.useState([]);

	// Find group members
	useEffect(() => {
		const currentUser = state.firebase.getCurrentUser().uid;
		setCurrentUser(currentUser);
		const findGroupMembers = async () => {
			let groups = await state.firebase
				.userGroups()
				.get()
				.then(querySnapshot => {
					return _.groupBy(querySnapshot.docs, item => item.data().userIds);
				});
			const list = groups;
			let group = [];
			for (let i = 0; i < Object.keys(list).length; i++) {
				const newList = Object.keys(list)[i].split(',');
				if (newList.includes(currentUser)) {
					group = newList;
					setGroupMembers(newList);
				}
			}
			let users = await state.firebase
				.users()
				.get()
				.then(querySnapshot => {
					return _.fromPairs(
						querySnapshot.docs.map(item => [item.id, item.data()])
					);
				});
			let names = [];
			for (let j = 0; j < group.length; j++) {
				for (let z = 0; z < Object.keys(users).length; z++) {
					if (Object.keys(users)[z] === group[j]) {
						names.push(Object.values(users)[z].name);
					}
				}
			}
			setGroupNames(names);
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
						_.fromPairs(
							_.map(userGroup, item => [
								item.id,
								{
									bets: item.data()[state.state.location.state.groupChar],
									name: item.data().name
								}
							])
						)
					);
				});
		};
		fetchGroupBets();
	}, []);

	const listGroups = () => {
		const groupJSX = [];
		for (let j = 0; j < Object.keys(groupBets).length; j++) {
			groupJSX.push(
				<p className={styles.center} key={j}>
					{Object.values(groupBets)[j].name}
				</p>
			);
			if (_.values(groupBets)[j].bets === undefined) {
				groupJSX.push(
					<p className={styles.center}>Käyttäjä ei ole veikannut vielä</p>
				);
			} else {
				for (let i = 0; i < state.state.location.state.matches.length; i++) {
					groupJSX.push(
						<Card
							key={`${Object.values(groupBets)[j].name} ${i}`}
							home={getFlag(state.state.location.state.matches[i].home)}
							away={getFlag(state.state.location.state.matches[i].away)}
							homeScore={
								<Typography>{_.values(groupBets)[j].bets[i * 2]}</Typography>
							}
							awayScore={
								<Typography>
									{_.values(groupBets)[j].bets[i * 2 + 1]}
								</Typography>
							}
						/>
					);
				}
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
	groupContainer: {
		margin: '20px',
		height: 50
	},
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
