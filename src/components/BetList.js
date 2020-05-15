import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { getFlag } from '../utils/utils';
import Card from './Card';
import Box from '@material-ui/core/Box';
import HeaderComponent from './HeaderComponent';

const BetList = state => {
	const styles = useStyles();

	const [bets, setBets] = React.useState(Array(12).fill(-1));
	const [errors, setErrors] = React.useState([]); // 1 === error, 0 === no error

	const handleBets = (bet, i) => {
		const firstList = bets;
		firstList[i] = bet;
		setBets(firstList);
	};

	const listGroups = () => {
		const groupJSX = [];
		for (let i = 0; i < state.state.location.state.matches.length; i++) {
			groupJSX.push(
				<Card
					key={i}
					home={getFlag(state.state.location.state.matches[i].home)}
					homeScore={
						<TextField
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
					away={getFlag(state.state.location.state.matches[i].away)}
					awayScore={
						<TextField
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
			<div key={'listGroups'}>{listGroups()}</div>
			<Button
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
						state.firebase
							.users()
							.doc(state.firebase.getCurrentUser().uid)
							.set(
								{
									[state.state.location.state.groupChar]: bets
								},
								{ merge: true }
							);
						state.state.history.push({
							pathname: '/matsi',
							state: {
								matches: state.state.location.state.matches,
								groupChar: state.state.location.state.groupChar
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

export default BetList;
