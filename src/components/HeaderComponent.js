import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles(theme => ({
	center: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center'
	},
	red: {
		backgroundColor: 'white',
		elevation: 3
	}
}));

const HeaderComponent = props => {
	const classes = useStyles();

	return (
		<Grid container justify="center" alignItems="center">
			<Grid item className={classes.red}>
				<div className={classes.center}>{props.name}</div>
			</Grid>
		</Grid>
	);
};

export default HeaderComponent;
