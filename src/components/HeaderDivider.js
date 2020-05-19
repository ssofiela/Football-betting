import React from 'react';
import { Typography, Grid, Divider, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() => ({
	container: {
		marginTop: 10,
		alignItems: 'center',
	},
	header: {
		marginLeft: 20,
		marginRight: 20,
		fontVariant: 'small-caps',
	},
}));

const HeaderDivider = (props) => {
	const classes = useStyles();
	return (
		<Grid container className={classes.container}>
			<Grid item xs>
				<Divider />
			</Grid>
			<h2 className={classes.header}>{props.children}</h2>
			<Grid item xs>
				<Divider />
			</Grid>
		</Grid>
	);
};

export default HeaderDivider;
