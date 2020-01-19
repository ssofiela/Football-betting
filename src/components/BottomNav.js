import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import RestoreIcon from '@material-ui/icons/Restore';
import FavoriteIcon from '@material-ui/icons/Favorite';
import LocationOnIcon from '@material-ui/icons/LocationOn';

const useStyles = makeStyles(theme => ({
	root: {
		width: '100%',
		position: 'absolute',
		bottom: '0px',
		backgroundColor: theme.color
	},
	navAction: {
		color: 'blue'
	}
}));

export default function SimpleBottomNavigation(props) {
	const classes = useStyles();
	const [value, setValue] = React.useState('/');

	return (
		<BottomNavigation
			value={value}
			onChange={(event, newValue) => {
				setValue(newValue);
				props.history.push(newValue);
			}}
			showLabels
			className={classes.root}
		>
			<BottomNavigationAction
				value={'/'}
				label="Veikkaukset"
				icon={<RestoreIcon />}
				className={classes.navAction}
			/>
			<BottomNavigationAction
				value={'/tulokset'}
				label="Tulokset"
				icon={<FavoriteIcon />}
				className={classes.navAction}
			/>
		</BottomNavigation>
	);
}
