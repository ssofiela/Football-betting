import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { setTitle } from '../redux/actions';
import { makeStyles } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { getFlag, convertFinals, checkActivity } from '../utils/utils';
import Card from './Card';
import HeaderComponent from './HeaderComponent';

const BetList = props => {
	const styles = useStyles();

	const [bets, setBets] = useState(Array(12).fill(-1));
	const [errors, setErrors] = useState([]); // 1 === error, 0 === no error
	const [isActive, setIsActive] = useState(true);
	const { groupChar, matches } = props.state.location.state;

	useEffect(() => {
		props.setTitle(
			groupChar.length === 1 ? 'Lohko ' + groupChar : convertFinals(groupChar)
		);
		setIsActive(checkActivity(groupChar));
	}, []);

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
							inputProps={{ min: 0, style: { textAlign: 'center' } }}
							onChange={event => handleBets(event.target.value, i * 2)}
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
							inputProps={{ min: 0, style: { textAlign: 'center' } }}
							onChange={event => handleBets(event.target.value, i * 2 + 1)}
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
			<HeaderComponent name="Syötä veikkaukset" />
			<div>{listMatches()}</div>
			<Button
				disabled={!isActive}
				fullWidth
				variant="contained"
				color="primary"
				className={styles.submit}
				onClick={() => {
					let fullList = true;
					let errorList = Array(12).fill(0);
					for (let i = 0; i < bets.length; i++) {
						if (bets[i] === -1) {
							fullList = false;
							errorList[i] = 1;
						}
					}
					setErrors(errorList);
					if (fullList) {
						props.firebase
							.users()
							.doc(props.firebase.getCurrentUser().uid)
							.set(
								{
									[groupChar]: bets
								},
								{ merge: true }
							);
						props.state.history.push({
							pathname: '/matsi',
							state: {
								matches: matches,
								groupChar: groupChar
							}
						});
					}
				}}
			>
				Tallenna
			</Button>
		</div>
	);
};

const useStyles = makeStyles(theme => ({
	groupContainer: { margin: '20px', height: 50 },
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
		textAlign: 'center',
		alignItems: 'center',
		justifyContent: 'center'
	}
}));

export default connect(null, { setTitle })(BetList);
