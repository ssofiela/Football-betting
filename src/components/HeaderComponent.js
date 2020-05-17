import React from 'react';
import { makeStyles, Grid } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
	center: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		fontVariant: 'small-caps',
		marginTop: 5,
		fontSize: 20,
	},
	GridStyle: {
		elevation: 3,
	},
	blue: {
		backgroundColor: 'aliceblue',
	},
	white: {
		backgroundColor: '#FFF',
	},
}));

const HeaderComponent = (props) => {
	const classes = useStyles();

	return (
		<Grid container justify="center" alignItems="center">
			<Grid
				item
				className={[
					classes.GridStyle,
					props.backgroundColor ? classes.blue : classes.white,
				].join(' ')}
			>
				<div className={classes.center}>{props.name}</div>
			</Grid>
		</Grid>
	);
};

export default HeaderComponent;
