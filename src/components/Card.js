import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import { getFlag } from '../utils/utils';

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

const Card = props => {
	const styles = useStyles();

	return (
		<Paper key={props.key} elevation={3} className={styles.groupContainer}>
			<form className={styles.root} noValidate autoComplete="off">
				<Grid container direction="row">
					<Grid item xs className={styles.center}>
						{props.home}
					</Grid>
					<Grid item xs={2} className={styles.center}>
						<Box width={1 / 4}>{props.homeScore}</Box>
					</Grid>
					<Grid item xs={2} className={styles.center}>
						<Box fontWeight="fontWeightMedium" fontSize={20}>
							-
						</Box>
					</Grid>
					<Grid item xs={2} className={styles.center}>
						<Box width={1 / 4}>{props.awayScore}</Box>
					</Grid>
					<Grid item xs className={styles.center}>
						{props.away}
					</Grid>
				</Grid>
			</form>
		</Paper>
	);
};

export default Card;
