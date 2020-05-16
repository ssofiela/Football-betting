import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { makeStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import HeaderComponent from './HeaderComponent';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { getPoints } from '../utils/utils';

const useStyles = makeStyles(theme => ({
	container: {
		position: 'relative'
	},
	chip: {
		marginTop: 10,
		margin: 5
	},
	scoreboard: {
		textAlign: 'center',
		alignItems: 'center',
		justifyContent: 'center'
	},
	showmore: {
		position: 'absolute',
		right: 5,
		bottom: 2
	}
}));

const Scoreboard = props => {
	const classes = useStyles();
	const [scoreboard, setScoreBoard] = useState([]);
	const [groupName, setGroupName] = useState('');
	const [showAll, setShowAll] = useState(false);

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
					_.pickBy(users, item => item.userGroup === currentUser.userGroup)
				).map(user => {
					return {
						points: countPoints(user, matches),
						username: user.name ? user.name : 'Anonymous',
						id: user.id
					};
				}),
				['points']
			).reverse();

			setGroupName(currentUser.userGroup);
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
					points += getPoints(
						userBets[index * 2],
						userBets[index * 2 + 1],
						match.homeScore,
						match.awayScore
					);
				});
			}
		}
		return points;
	};
	const getScoreboard = topHowMany => {
		console.log(scoreboard);
		const medalColors = ['#FFDF00', '#C0C0C0', '#cd7f32'];

		return _.chunk(
			scoreboard.slice(0, topHowMany).map((user, index) => {
				const chipColor = index > 2 ? 'blue' : medalColors[index];
				return (
					<Chip
						key={user.username}
						label={user.username + ' ' + user.points + 'p'}
						clickable
						className={classes.chip}
						onClick={() =>
							props.history.push({ pathname: 'pelaaja', state: { user } })
						}
						style={{ backgroundColor: chipColor }}
					/>
				);
			}),
			3
		).map(row => (
			<div key={row} className={classes.center}>
				{row}
			</div>
		));
	};

	return (
		<Paper elevation={3} className={classes.container}>
			<HeaderComponent name={groupName} />

			<div className={`${classes.scoreboard} `}>
				{showAll ? getScoreboard(scoreboard.length) : getScoreboard(3)}
			</div>
			<IconButton
				aria-label="show more or less"
				className={classes.showmore}
				onClick={() => setShowAll(!showAll)}
			>
				{showAll ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
			</IconButton>
		</Paper>
	);
};

export default Scoreboard;
