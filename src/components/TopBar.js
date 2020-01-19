import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Grid from '@material-ui/core/Grid';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

const useStyles = makeStyles(theme => ({
	root: {
		flexGrow: 1
	},
	menuButton: {
		marginRight: theme.spacing(2)
	},
	title: {
		flexGrow: 1,
		textAlign: 'center'
	},
	logoutIcon: {
		color: 'white'
	}
}));

export default function ButtonAppBar() {
	const classes = useStyles();

	return (
		<div className={classes.root}>
			<AppBar position="static">
				<Toolbar>
					<Grid container spacing={3} justify="center" alignItems="center">
						<Grid item xs={2} />
						<Grid item xs={8}>
							<Typography variant="h5" className={classes.title}>
								EM-KISAVEIKKAUS
							</Typography>
						</Grid>
						<Grid item xs={2}>
							<IconButton aria-label="log out">
								<ExitToAppIcon
									fontSize="large"
									className={classes.logoutIcon}
								/>
							</IconButton>
						</Grid>
					</Grid>
				</Toolbar>
			</AppBar>
		</div>
	);
}
