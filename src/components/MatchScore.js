import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { setTitle } from '../redux/actions';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { makeStyles, Typography } from '@material-ui/core';
import _ from 'lodash';
import { getFlag, getPoints } from '../utils/utils';
import Card from './Card';
import CircularProgress from '@material-ui/core/CircularProgress';
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
	const [groups, setGroups] = useState({});

	// Find group members
	useEffect(() => {
		props.setTitle('Lohko ' + props.state.location.state.groupChar);
		console.log(props);
		const currentUser = props.firebase.getCurrentUser().uid;
		const findGroupMembers = async () => {
			let matches = await props.firebase
				.matches()
				.get()
				.then(querySnapshot => {
					return _.groupBy(
						querySnapshot.docs.map(item => item.data()),
						item => item.group
					);
				});
			setGroups(matches);
		};
		findGroupMembers();

		const fetchGroupBets = async () => {
			await props.firebase
				.users()
				.get()
				.then(users => {
					const groupName = _.find(
						users.docs,
						item => item.id === currentUser
					).data().userGroup;
					const userGroup = _.filter(
						users.docs,
						item => item.data().userGroup === groupName
					);
					setGroupBets(
						_.fromPairs(
							_.map(userGroup, item => [
								item.id,
								{
									bets: item.data()[props.state.location.state.groupChar],
									name: item.data().name
								}
							])
						)
					);
				});
		};
		fetchGroupBets();
	}, []);

	const listGroups = () => {
		const groupJSX = [];
		if (Object.keys(groups).length > 0) {
			for (let j = 0; j < Object.keys(groupBets).length; j++) {
				let resultFound = true;
				groupJSX.push(
					<p className={styles.center} key={j}>
						{Object.values(groupBets)[j].name}
					</p>
				);
				if (_.values(groupBets)[j].bets === undefined) {
					groupJSX.push(
						<p className={styles.center}>Käyttäjä ei ole veikannut vielä</p>
					);
				} else {
					for (let i = 0; i < props.state.location.state.matches.length; i++) {
						// Check if the game is end
						const rightGame = groups[props.state.location.state.groupChar][i];
						if (rightGame.homeScore === -1 || rightGame.awayScore === -1) {
							resultFound = false;
						}
						groupJSX.push(
							<Grid
								key={`grid ${i}, ${j}`}
								container
								style={{ direction: 'row', display: 'flex' }}
							>
								<Grid item xs={10}>
									<Card
										key={`${Object.values(groupBets)[j].name} ${i}`}
										home={getFlag(props.state.location.state.matches[i].home)}
										away={getFlag(props.state.location.state.matches[i].away)}
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
										groups={groups}
										groupChar={props.state.location.state.groupChar}
										homeScore={_.values(groupBets)[j].bets[i * 2]}
										awayScore={_.values(groupBets)[j].bets[i * 2 + 1]}
									/>
								</Grid>
							</Grid>
						);
					}
				}
				groupJSX.push(<HorizontalDivider />);
			}
		} else {
			groupJSX.push(
				<div key={'inProgress'}>
					<Grid container justify="center" alignItems="center">
						<Grid item>
							<CircularProgress color="secondary" />
						</Grid>
					</Grid>
				</div>
			);
		}

		return groupJSX;
	};

	return (
		<div>
			<div key={'listGroups'}>{!_.isEmpty(groupBets) && listGroups()}</div>
		</div>
	);
};

export default connect(null, { setTitle })(MacthScore);
