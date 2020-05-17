import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { getMatches, getUserGroup, getUserUid } from '../redux/actions';
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
	},
	gold: { backgroundColor: theme.palette.chipColor.gold },
	silver: { backgroundColor: theme.palette.chipColor.silver },
	bronze: { backgroundColor: theme.palette.chipColor.bronze },
	others: { backgroundColor: theme.palette.primary.main, color: 'white' }
}));

const Scoreboard = props => {
	const classes = useStyles();
	const [scoreboard, setScoreBoard] = useState([]);
	const [groupName, setGroupName] = useState('');
	const [showAll, setShowAll] = useState(false);

	useEffect(() => {
		const currentUser = props.getUserGroup[props.getUserUid];
		const scoreboard = _.sortBy(
			_.values(
				_.pickBy(
					props.getUserGroup,
					item => item.userGroup === currentUser.userGroup
				)
			).map(user => {
				return {
					points: countPoints(user, props.getMatches),
					username: user.name ? user.name : 'Anonymous',
					id: user.id
				};
			}),
			['points']
		).reverse();
		setGroupName(currentUser.userGroup);
		setScoreBoard(scoreboard);
	}, []);

	const countPoints = (user, matches) => {
		const groupChars = 'ABCDEF';
		let points = 0;
		for (let groupChar of groupChars) {
			const userBets = user[groupChar];
			if (userBets) {
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
		const medalColors = [classes.gold, classes.silver, classes.bronze];
		return _.chunk(
			scoreboard.slice(0, topHowMany).map((user, index) => {
				const chipColor = index > 2 ? classes.others : medalColors[index];
				return (
					<Chip
						key={user.username}
						label={user.username + ' ' + user.points + 'p'}
						clickable
						className={`${classes.chip} ${chipColor}`}
						onClick={() =>
							props.history.push({
								pathname: 'pelaaja',
								state: { user, serverData: props.serverData }
							})
						}
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
			<HeaderComponent backgroundColor={false} name={groupName} />

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

const mapStateToProps = state => {
	return {
		getMatches: getMatches(state),
		getUserGroup: getUserGroup(state),
		getUserUid: getUserUid(state)
	};
};

export default connect(mapStateToProps, null)(Scoreboard);
