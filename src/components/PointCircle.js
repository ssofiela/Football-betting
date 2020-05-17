import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { getMatches, getUserGroup, getUserUid } from '../redux/actions';
import Paper from '@material-ui/core/Paper';
import { getPoints } from '../utils/utils';
import { makeStyles } from '@material-ui/core';
import SportsSoccerIcon from '@material-ui/icons/SportsSoccer';

const useStyles = makeStyles((theme) => ({
	points: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 10,
		marginBottom: 10,
		marginRight: 10,
		height: '44px',
		width: '44px',
		borderRadius: '50%',
		borderStyle: 'solid',
		borderWidth: '3px',
	},
	rightAns: {
		backgroundColor: theme.palette.points.rightAnswer,
		borderColor: theme.palette.chipColor.gold,
	},
	rightWin: {
		backgroundColor: theme.palette.points.rightAnswer,
		borderColor: theme.palette.points.rightAnswer,
	},
	wrongAns: {
		backgroundColor: theme.palette.points.wrongAnswer,
		borderColor: theme.palette.points.wrongAnswer,
	},
	notPlayed: {
		backgroundColor: theme.palette.points.notPlayed,
		borderColor: theme.palette.points.notPlayed,
	},
	textStyle: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		color: 'white',
	}
}));

const PointCircle = (props) => {
	const classes = useStyles();
	const [points, setPoints] = React.useState(-1);

	useEffect(() => {
		const calculatePoints = (index, homeScore, awayScore) => {
			const char = props.groupChar;
			const rightGame = props.getMatches[char][index];
			const rightHomeScore = rightGame.homeScore;
			const rightAwayScore = rightGame.awayScore;
			if (rightHomeScore >= 0 && rightAwayScore >= 0) {
				const value = getPoints(
					homeScore,
					awayScore,
					rightHomeScore,
					rightAwayScore
				);
				setPoints(value);
			}
		};
		calculatePoints(props.index, props.homeScore, props.awayScore);
	}, []);

	return (
		<Paper
			key={`Points ${props.key}`}
			elevation={3}
			className={[
				classes.points,
				points < 0
					? classes.notPlayed
					: points === 3
					? classes.rightAns
					: points === 1
					? classes.rightWin
					: classes.wrongAns,
			].join(' ')}
		>
			<div
				className={classes.textStyle}
			>
				{points < 0 ? <SportsSoccerIcon fontSize='large' /> : `${points}p`}
			</div>
		</Paper>
	);
};

const mapStateToProps = (state) => {
	return {
		getMatches: getMatches(state),
		getUserGroup: getUserGroup(state),
		getUserUid: getUserUid(state),
	};
};

export default connect(mapStateToProps, null)(PointCircle);
