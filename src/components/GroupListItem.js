import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import _ from 'lodash';
import { getFlag } from '../utils/utils';

const GroupListItem = props => {
	const styles = useStyles();
	const getTeams = () => {
		const uniqTeams = [];
		//console.log(props.groupMatches);
		props.groupMatches.forEach(match => {
			const matchData = match.data();
			if (!uniqTeams.includes(matchData.home)) {
				uniqTeams.push(matchData.home);
			}
			if (!uniqTeams.includes(matchData.away)) {
				uniqTeams.push(matchData.away);
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
									matches: props.groupMatches.map(match => match.data()),
									groupChar: props.groupChar
								}
						  }
						: {
								pathname: '/matsi',
								state: {
									matches: props.groupMatches.map(match => match.data()),
									groupChar: props.groupChar
								}
						  }
				)
			}
		>
			<Grid container direction="row" justify="space-evenly">
				<p>Lohko {props.groupChar}</p>
				{getTeams()}
			</Grid>
		</Paper>
	);
};

const useStyles = makeStyles(theme => ({
	groupContainer: { margin: '20px' }
}));
export default GroupListItem;
