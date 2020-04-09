import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';

const BetList = state => {
	const styles = useStyles();

	const [bets, setBets] = React.useState([]);


	const handleBets = (bet, i) => {
		const firstList = bets;
		firstList[i] = bet;
		setBets(firstList);
	};


	const listGroups = () => {
		const groupJSX = [];
		for (let i = 0; i < state.state.location.state.matches.length; i++) {
			groupJSX.push(
				<Paper key={i} elevation={3} className={styles.groupContainer}>
					<form className={styles.root} noValidate autoComplete="off">
						<Grid container xs direction="row" key={i}>
							<Grid item xs className={styles.center}>
								<a>{state.state.location.state.matches[i].away}</a>
							</Grid>
							<Grid item xs={2} className={styles.center}>
								<Box width={1 / 4}>
									<TextField
										required
										name="bet"
										type="number"
										id="bet"
										inputProps={{ min: 0, style: { textAlign: 'center' } }}
										onChange={event => handleBets(event.target.value, i*2)}
										fullwidth={true}
									/>
								</Box>
							</Grid>
							<Grid item xs={2} className={styles.center}>
								<Box fontWeight="fontWeightMedium" fontSize={20}>
									-
								</Box>
							</Grid>
							<Grid item xs={2} className={styles.center}>
								<Box width={1 / 4}>
									<TextField
										required
										name="bet"
										type="number"
										id="bet"
										inputProps={{ min: 0, style: { textAlign: 'center' } }}
										onChange={event => handleBets(event.target.value, i*2+1)}
										fullwidth={true}
									/>
								</Box>
							</Grid>
							<Grid item xs className={styles.center}>
								<a>{state.state.location.state.matches[i].home}</a>
							</Grid>
						</Grid>
					</form>
				</Paper>
			);
		}
		return groupJSX;
	};

	return (
		<div>
			<div key={'listGroups'}>{listGroups()}</div>
			<Button
				fullWidth
				variant="contained"
				color="primary"
				className={styles.submit}
				onClick={() => {
					state.state.history.push({
						pathname: '/matsi',
						state: {matches: state.state.location.state.matches}
					});
					console.log(bets)
				}}
			>
				Tallenna
			</Button>
		</div>
	);
};

const useStyles = makeStyles(theme => ({
	groupContainer: { margin: '20px' },
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
	}
}));

export default BetList;
