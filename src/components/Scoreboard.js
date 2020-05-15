import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { makeStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import HeaderComponent from "./HeaderComponent";

const useStyles = makeStyles(theme => ({
	chip: {
		marginTop: 10,
		margin: 5
	}
}));

const Scoreboard = props => {
	const classes = useStyles();
	const [groups, setGroups] = useState({});
	const [scoreboard, setScoreBoard] = useState([]);
	const [groupName, setGroupName] = useState('');

	useEffect(() => {
		const fetchGroups = async () => {
			let matches = await props.firebase
				.matches()
				.get()
				.then(querySnapshot => {
					return _.groupBy(
						querySnapshot.docs.map(item => item.data()),
						item => item.group
					);
				});
			let users = await props.firebase
				.users()
				.get()
				.then(querySnapshot => {
					return _.fromPairs(
						querySnapshot.docs.map(item => [
							item.id,
							{ ...item.data(), id: item.id }
						])
					);
				});
			const currentUser = users[props.firebase.getCurrentUser().uid];
			console.log(currentUser);
			const scoreboard = _.sortBy(
				_.values(
					_.pickBy(users, item => item.userGroup == currentUser.userGroup)
				).map(user => {
					return {
						points: countPoints(user, matches),
						username: user.name ? user.name : 'Tomi Panula',
						id: user.id
					};
				}),
				['points']
			).reverse();

			setGroupName(currentUser.userGroup);
			setGroups(matches);
			setScoreBoard(scoreboard);
		};
		fetchGroups();
	}, []);

	const countPoints = (user, matches) => {
		const groupChars = 'ABCDEF';
		let points = 0;
		console.log(user);
		for (let groupChar of groupChars) {
			const userBets = user[groupChar];
			if (userBets) {
				console.log(groupChar, userBets);
				matches[groupChar].forEach((match, index) => {
					if (
						match.homeScore >= 0 &&
						match.awayScore >= 0 &&
						userBets[index] >= 0 &&
						userBets[index + 1] >= 0
					) {
						if (
							(match.homeScore - match.awayScore) *
								(userBets[index] - userBets[index + 1]) >
								0 ||
							match.homeScore - match.awayScore ==
								userBets[index] - userBets[index + 1]
						) {
							if (
								match.homeScore == userBets[index] &&
								match.awayScore == userBets[index + 1]
							) {
								points += 3;
							} else {
								points += 1;
							}
						}
					}
				});
			}
		}
		return points;
	};
	const getScoreboard = () => {
		console.log(scoreboard);
		return scoreboard.map(user => (
			<Chip
				key={user.username}
				label={user.username + ' ' + user.points + 'p'}
				clickable
				color="primary"
				className={classes.chip}
				onClick={() =>
					props.history.push({ pathname: 'pelaaja', state: { user } })
				}
			/>
		));
	};

	return (
		<div>
			<HeaderComponent name={groupName}/>
			<div>{getScoreboard()}</div>
		</div>
	);
};

export default Scoreboard;
