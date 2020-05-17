import React from 'react';
import { makeStyles, Grid, Paper, Box } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
	groupContainer: { margin: '10px', height: 50 },
	root: {
		'& .MuiTextField-root': {
			maxWidth: 100,
		},
	},
	center: {
		display: 'flex',
		textAlign: 'center',
		alignItems: 'center',
		justifyContent: 'center',
	},
}));

const Card = (props) => {
	const classes = useStyles();
	return (
		<Paper elevation={3} className={classes.groupContainer}>
			<form className={classes.root} noValidate autoComplete="off">
				<Grid container direction="row">
					<Grid item xs className={classes.center}>
						{props.home}
					</Grid>
					<Grid item xs={2} className={classes.center}>
						<Box width={1 / 4}>{props.homeScore}</Box>
					</Grid>
					<Grid item xs={2} className={classes.center}>
						<Box fontWeight="fontWeightMedium" fontSize={20}>
							-
						</Box>
					</Grid>
					<Grid item xs={2} className={classes.center}>
						<Box width={1 / 4}>{props.awayScore}</Box>
					</Grid>
					<Grid item xs className={classes.center}>
						{props.away}
					</Grid>
				</Grid>
			</form>
		</Paper>
	);
};

export default Card;
