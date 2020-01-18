import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import GroupPage from '../pages/GroupPage';

function TabPanel(props) {
	const { children, value, index, ...other } = props;

	return (
		<Typography
			component="div"
			role="tabpanel"
			hidden={value !== index}
			id={`full-width-tabpanel-${index}`}
			aria-labelledby={`full-width-tab-${index}`}
			{...other}
		>
			{value === index && <Box p={3}>{children}</Box>}
		</Typography>
	);
}

TabPanel.propTypes = {
	children: PropTypes.node,
	index: PropTypes.any.isRequired,
	value: PropTypes.any.isRequired
};

function a11yProps(index) {
	return {
		id: `full-width-tab-${index}`,
		'aria-controls': `full-width-tabpanel-${index}`
	};
}

const useStyles = makeStyles(theme => ({
	root: {
		backgroundColor: theme.palette.background.paper,
		width: 500
	}
}));

const TopBar = props => {
	const classes = useStyles();
	const theme = useTheme();
	const [value, setValue] = React.useState('/');

	const handleChange = (event, newValue) => {
		setValue(newValue);
		props.history.push(newValue);
	};
	return (
		<div className={classes.root}>
			<AppBar position="static" color="default">
				<Tabs
					value={value}
					onChange={handleChange}
					indicatorColor="primary"
					textColor="primary"
					variant="fullWidth"
					aria-label="full width tabs example"
				>
					<Tab value="/" label="Veikkaukset" {...a11yProps(0)} />
					<Tab value="/tulokset" label="Tulokset" {...a11yProps(1)} />
				</Tabs>
			</AppBar>
		</div>
	);
};

export default TopBar;
