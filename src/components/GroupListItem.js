import React from 'react';
import { makeStyles, Grid, Paper } from '@material-ui/core';
import { getFlag, convertFinals } from '../utils/utils';

const useStyles = makeStyles(() => ({
	groupContainer: { margin: '20px', cursor: 'pointer' },
	textStyle: {fontVariant: 'small-caps'},
}));

const GroupListItem = (props) => {
	const classes = useStyles();
	const getTeams = () => {
		const uniqTeams = [];
		props.groupMatches.forEach((match) => {
			if (!uniqTeams.includes(match.home)) {
				uniqTeams.push(match.home);
			}
			if (!uniqTeams.includes(match.away)) {
				uniqTeams.push(match.away);
			}
		});
		return uniqTeams.map((team) => {
			return getFlag(team);
		});
	};
	return (
		<Paper
			elevation={3}
			className={classes.groupContainer}
			onClick={() =>
				props.history.push(
					props.needBet
						? {
								pathname: '/veikkaa',
								state: {
									matches: props.groupMatches,
									groupChar: props.groupChar,
								},
						  }
						: {
								pathname: '/matsi',
								state: {
									matches: props.groupMatches,
									groupChar: props.groupChar,
								},
						  }
				)
			}
		>
			{props.groupChar.length === 1 ? (
				<Grid
					container
					direction='row'
					justify='space-evenly'
					alignItems='center'
				>
					<p className={classes.textStyle}>
						{'Lohko ' + props.groupChar}
					</p>
					{getTeams()}
				</Grid>
			) : (
				<Grid container direction='row' justify='space-evenly'>
					<p className={classes.textStyle}>
						{convertFinals(props.groupChar)}
					</p>
				</Grid>
			)}
		</Paper>
	);
};

export default GroupListItem;
