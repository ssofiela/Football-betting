import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
	setTitle,
	getMatches,
	getUserGroup,
	getUserUid,
} from '../redux/actions';
import Grid from '@material-ui/core/Grid';
import { makeStyles, Typography } from '@material-ui/core';
import _ from 'lodash';
import { getFlag, convertFinals } from '../utils/utils';
import Card from './Card';
import PointCircle from './PointCircle';
import HorizontalDivider from './HorizontalDivider';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles((theme) => ({
	center: {
		display: 'flex',
		margin: '10px',
		textAlign: 'center',
		alignItems: 'center',
		justifyContent: 'center',
	},
	pointsCentered: {
		display: 'flex',
		textAlign: 'center',
		alignItems: 'center',
		justifyContent: 'center',
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
	textStyle: {
		fontVariant: 'small-caps',
	},
	row: {
		direction: 'row',
		display: 'flex'
	}
}));

const MacthScore = (props) => {
	const classes = useStyles();
	const [groupBets, setGroupBets] = useState([]);
	const [showSnackBar, setShowSnackbar] = useState(false);
	const { groupChar, matches, justSaved } = props.state.location.state;

	// Find group members
	useEffect(() => {
		props.setTitle(
			groupChar.length === 1 ? 'Lohko ' + groupChar : convertFinals(groupChar)
		);

		setGroupBets(
			_.fromPairs(
				_.map(props.getUserGroup, (user) => [
					user.id,
					{
						bets: user[groupChar],
						name: user.name,
					},
				])
			)
		);
		setShowSnackbar(justSaved);
	}, []);

	const listGroups = () => {
		const groupJSX = [];
		for (let j = 0; j < Object.keys(groupBets).length; j++) {
			groupJSX.push(
				<h3 className={[classes.center, classes.textStyle].join(' ')} key={j}>
					{Object.values(groupBets)[j].name}
				</h3>
			);
			if (_.values(groupBets)[j].bets === undefined) {
				groupJSX.push(
					<p className={classes.center} key={'text' + j}>
						{`Veikkaukset tulille, ${Object.values(groupBets)[j].name}!`}
					</p>
				);
			} else {
				for (let i = 0; i < matches.length; i++) {
					groupJSX.push(
						<Grid
							key={`grid ${i}, ${j}`}
							container
							className={classes.row}
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
							<Grid item xs={2} className={classes.pointsCentered}>
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

	const closeSnackbar = (event, reason) => {
		if (reason === 'clickaway') {
			return;
		}

		setShowSnackbar(false);
	};

	return (
		<div>
			<div key={'listGroups'}>{!_.isEmpty(groupBets) && listGroups()}</div>
			<Snackbar
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'left',
				}}
				open={showSnackBar}
				autoHideDuration={6000}
				onClose={closeSnackbar}
				message='Veikkaukset tallennettu!'
				action={
					<React.Fragment>
						<IconButton
							size='small'
							aria-label='close'
							color='inherit'
							onClick={closeSnackbar}
						>
							<CloseIcon fontSize='small' />
						</IconButton>
					</React.Fragment>
				}
			/>
		</div>
	);
};

const mapStateToProps = (state) => {
	return {
		getMatches: getMatches(state),
		getUserGroup: getUserGroup(state),
		getUserUid: getUserUid(state),
	};
};

export default connect(mapStateToProps, { setTitle })(MacthScore);
