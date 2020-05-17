import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import { getFlag } from '../utils/utils';

const GroupListItem = props => {
	const styles = useStyles();
	const getTeams = () => {
		const uniqTeams = [];
		console.log(props);
		props.groupMatches.forEach(match => {
			if (!uniqTeams.includes(match.home)) {
				uniqTeams.push(match.home);
			}
			if (!uniqTeams.includes(match.away)) {
				uniqTeams.push(match.away);
			}
		});
		return uniqTeams.map(team => {
			return getFlag(team);
		});
	};
	return (
		<Paper
			elevation={3}
			className={styles.groupContainer}
			onClick={() =>
				props.history.push(
					props.needBet
						? {
								pathname: '/veikkaa',
								state: {
									matches: props.groupMatches,
									groupChar: props.groupChar
								}
						  }
						: {
								pathname: '/matsi',
								state: {
									matches: props.groupMatches,
									groupChar: props.groupChar
								}
						  }
				)
			}
		>
			<Grid container direction="row" justify="space-evenly">
				<p>{'Lohko ' + props.groupChar}</p>
				{getTeams()}
			</Grid>
		</Paper>
	);
};

const useStyles = makeStyles(theme => ({
	groupContainer: { margin: '20px', cursor: 'pointer' }
}));
export default GroupListItem;
