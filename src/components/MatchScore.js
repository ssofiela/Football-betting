import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
	setTitle,
	getMatches,
	getUserGroup,
	getUserUid
} from '../redux/actions';
import Grid from '@material-ui/core/Grid';
import { makeStyles, Typography } from '@material-ui/core';
import _ from 'lodash';
import { getFlag, convertFinals } from '../utils/utils';
import Card from './Card';
import PointCircle from './PointCircle';
import HorizontalDivider from './HorizontalDivider';

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
	},
	points: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: '20px',
		height: '44px',
		width: '44px',
		borderRadius: '50%',
		borderStyle: 'solid',
		borderWidth: '3px'
	},
	rightAns: {
		backgroundColor: theme.palette.points.rightAnswer,
		borderColor: theme.palette.chipColor.gold
	},
	rightWin: {
		backgroundColor: theme.palette.points.rightAnswer,
		borderColor: theme.palette.points.rightAnswer
	},
	wrongAns: {
		backgroundColor: theme.palette.points.wrongAnswer,
		borderColor: theme.palette.points.wrongAnswer
	}
}));

const MacthScore = props => {
	const styles = useStyles();
	const [groupBets, setGroupBets] = React.useState([]);
	const { groupChar, matches } = props.state.location.state;

	// Find group members
	useEffect(() => {
		props.setTitle(
			groupChar.length === 1 ? 'Lohko ' + groupChar : convertFinals(groupChar)
		);

		setGroupBets(
			_.fromPairs(
				_.map(props.getUserGroup, user => [
					user.id,
					{
						bets: user[groupChar],
						name: user.name
					}
				])
			)
		);
	}, []);

	const listGroups = () => {
		const groupJSX = [];
		for (let j = 0; j < Object.keys(groupBets).length; j++) {
			groupJSX.push(
				<h2 className={styles.center} key={j}>
					{Object.values(groupBets)[j].name}
				</h2>
			);
			if (_.values(groupBets)[j].bets === undefined) {
				groupJSX.push(
					<p className={styles.center} key={'text' + j}>
						{`Veikkaukset tulille, ${Object.values(groupBets)[j].name}!`}
					</p>
				);
			} else {
				for (let i = 0; i < matches.length; i++) {
					groupJSX.push(
						<Grid
							key={`grid ${i}, ${j}`}
							container
							style={{ direction: 'row', display: 'flex' }}
						>
							<Grid item xs={10}>
								<Card
									home={getFlag(matches[i].home)}
									away={getFlag(matches[i].away)}
									homeScore={
										<Typography>
											{_.values(groupBets)[j].bets[i * 2]}
										</Typography>
									}
									awayScore={
										<Typography>
											{_.values(groupBets)[j].bets[i * 2 + 1]}
										</Typography>
									}
								/>
							</Grid>
							<Grid item xs={2} style={{ flexBasis: '0%' }}>
								<PointCircle
									index={i}
									groupChar={groupChar}
									homeScore={_.values(groupBets)[j].bets[i * 2]}
									awayScore={_.values(groupBets)[j].bets[i * 2 + 1]}
								/>
							</Grid>
						</Grid>
					);
				}
			}
			if (Object.keys(groupBets).length - 1 > j) {
				groupJSX.push(<HorizontalDivider key={'divider ' + j} />);
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

const mapStateToProps = state => {
	return {
		getMatches: getMatches(state),
		getUserGroup: getUserGroup(state),
		getUserUid: getUserUid(state)
	};
};

export default connect(mapStateToProps, { setTitle })(MacthScore);
