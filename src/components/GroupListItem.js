import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { Redirect, Link } from 'react-router-dom';
import Flag from 'react-flags';
import { convertIocCode } from 'convert-country-codes';
import _ from 'lodash';

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
			const greatBritain = { WAL: '_wales', ENG: '_england' };
			const convertedCountryCode = convertIocCode(team)
				? convertIocCode(team).iso3
				: _.has(greatBritain, team)
				? greatBritain[team]
				: 'UND';
			return (
				<Flag
					country={convertedCountryCode}
					format="png"
					pngSize={64}
					shiny={false}
					alt="Canada Flag"
					basePath="../img/flags/"
					width={48}
					height={48}
				/>
			);
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
