import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { setTitle, setUserGroup, getUserGroup } from '../redux/actions';
import { makeStyles, TextField, Button } from '@material-ui/core';
import { getFlag, convertFinals, checkActivity } from '../utils/utils';
import Card from './Card';
import HeaderComponent from './HeaderComponent';

const useStyles = makeStyles((theme) => ({
	submit: {
		margin: theme.spacing(3, 0, 2),
		fontVariant: 'small-caps',
	},
	center: {
		textAlign: 'center',
	},
}));

const BetList = (props) => {
	const classes = useStyles();
	const { groupChar, matches } = props.state.location.state;

	const [bets, setBets] = useState(Array(matches.length).fill(-1));
	const [errors, setErrors] = useState([]); // 1 === error, 0 === no error
	const [isActive, setIsActive] = useState(true);

	useEffect(() => {
		props.setTitle(
			groupChar.length === 1 ? 'Lohko ' + groupChar : convertFinals(groupChar)
		);
		setIsActive(checkActivity(groupChar));
	}, [props, groupChar]);

	const handleBets = (bet, i) => {
		const firstList = bets;
		firstList[i] = bet;
		setBets(firstList);
	};

	const listMatches = () => {
		const groupJSX = [];
		for (let i = 0; i < matches.length; i++) {
			groupJSX.push(
				<Card
					key={i}
					home={getFlag(matches[i].home)}
					homeScore={
						<TextField
							disabled={!isActive}
							required
							name="bet"
							type="number"
							id="bet"
							inputProps={{ min: 0, className: classes.center }}
							onChange={(event) => handleBets(event.target.value, i * 2)}
							fullWidth
							error={errors[i * 2] === 1}
						/>
					}
					away={getFlag(matches[i].away)}
					awayScore={
						<TextField
							disabled={!isActive}
							required
							name="bet"
							type="number"
							id="bet"
							inputProps={{ min: 0, className: classes.center }}
							onChange={(event) => handleBets(event.target.value, i * 2 + 1)}
							fullWidth
							error={errors[i * 2 + 1] === 1}
						/>
					}
				/>
			);
		}
		return groupJSX;
	};

	return (
		<div>
			<HeaderComponent
				backgroundColor={true}
				name={
					isActive
						? 'Syötä veikkaukset'
						: 'Otteluparit eivät ole vielä selvillä'
				}
			/>
			<div>{listMatches()}</div>
			<Button
				disabled={!isActive}
				fullWidth
				variant="contained"
				color="primary"
				className={classes.submit}
				onClick={() => {
					let fullList = true;
					let errorList = Array(matches.length).fill(0);
					for (let i = 0; i < bets.length; i++) {
						if (bets[i] === -1) {
							fullList = false;
							errorList[i] = 1;
						}
					}
					setErrors(errorList);
					if (fullList) {
						let updatedUserGroup = props.getUserGroup;
						updatedUserGroup[props.firebase.getCurrentUser().uid][groupChar] =
							bets;
						props.firebase
							.users()
							.doc(props.firebase.getCurrentUser().uid)
							.set(
								{
									[groupChar]: bets,
								},
								{ merge: true }
							);
						props.setUserGroup(updatedUserGroup);
						props.state.history.push({
							pathname: '/matsi',
							state: {
								matches: matches,
								groupChar: groupChar,
								justSaved: true,
							},
						});
					}
				}}
			>
				tallenna
			</Button>
		</div>
	);
};

const mapStateToProps = (state) => {
	return {
		getUserGroup: getUserGroup(state),
	};
};

export default connect(mapStateToProps, { setTitle, setUserGroup })(BetList);
