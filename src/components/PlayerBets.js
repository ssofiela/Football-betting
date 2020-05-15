import React, { useState, useEffect } from 'react';
import { makeStyles, Typography } from '@material-ui/core';
import _ from 'lodash';
import { getFlag } from '../utils/utils';
import Card from './Card';

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

	const listBets = () => {
		const betsJSX = [];
		_.toPairs(_.pick(userData, ['A', 'B', 'C', 'D', 'E', 'F'])).forEach(
			group => {
				betsJSX.push('Lohko ' + group[0]);
				matches[group[0]].forEach((match, index) => {
					console.log(match);
					betsJSX.push(
						<Card
							key={`${group[0]}${index}`}
							home={getFlag(match.home)}
							away={getFlag(match.away)}
							homeScore={<Typography>{group[1][index * 2]}</Typography>}
							awayScore={<Typography>{group[1][index * 2 + 1]}</Typography>}
						/>
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
