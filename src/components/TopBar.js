import React from 'react';
import { connect } from 'react-redux';
import { getTitle } from '../redux/actions';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import SportsSoccerIcon from '@material-ui/icons/SportsSoccer';

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
	iconButton: {
		padding: 0,
		margin: 0,
		color: 'black'
	},
	whiteIcon: {
		color: 'white',
		padding: 0,
		margin: 0
	}
}));

const TopBar = props => {
	const classes = useStyles();
	console.log(props);
	return (
		<AppBar position="sticky">
			<Toolbar>
				<Grid container spacing={3} justify="center" alignItems="center">
					<Grid item xs={2}>
						<IconButton
							aria-label="main page"
							onClick={() => {
								props.history.push('/login');
							}}
						>
							<SportsSoccerIcon
								fontSize="large"
								className={classes.whiteIcon}
							/>
						</IconButton>
					</Grid>
					<Grid item xs={8}>
						<Typography variant="h5" className={classes.title}>
							{props.getTitle}
						</Typography>
					</Grid>
					<Grid item xs={2}>
						<IconButton
							aria-label="log out"
							onClick={() => {
								props.firebase.doSignOut();
							}}
							className={classes.iconButton}
						>
							<ExitToAppIcon fontSize="large" className={classes.whiteIcon} />
						</IconButton>
					</Grid>
				</Grid>
			</Toolbar>
		</AppBar>
	);
};
const mapStateToProps = state => {
	return { getTitle: getTitle(state) };
};

export default connect(mapStateToProps, null)(TopBar);
