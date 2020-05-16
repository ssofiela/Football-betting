import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { setTitle } from '../redux/actions';
import { makeStyles, Typography } from '@material-ui/core';
import _ from 'lodash';
import { getFlag } from '../utils/utils';
import Card from './Card';

const PlayerBets = props => {
	const styles = useStyles();
	const [userData, setUserData] = React.useState([]);
	const [matches, setMatches] = React.useState([]);

	// Find group members
	useEffect(() => {
		console.log(props);
		props.setTitle(props.props.location.state.user.username);
		const fetchMatches = async () => {
			await props.firebase
				.matches()
				.get()
				.then(querySnapshot => {
					setMatches(
						_.groupBy(
							querySnapshot.docs.map(item => item.data()),
							item => item.group
						)
					);
				});
		};
		fetchMatches();
		console.log(props.props.location);
		const fetchUserData = async () => {
			await props.firebase
				.users()
				.get()
				.then(users => {
					setUserData(
						_.find(
							users.docs,
							user => user.id === props.props.location.state.user.id
						).data()
					);
				});
		};
		fetchUserData();
	}, []);

	const listBets = () => {
		const betsJSX = [];
		_.toPairs(_.pick(userData, ['A', 'B', 'C', 'D', 'E', 'F'])).forEach(
			group => {
				betsJSX.push(<h2 className={styles.center}>{`LOHKO ${group[0]}`}</h2>);
				matches[group[0]].forEach((match, index) => {
					console.log(match);
					betsJSX.push(
						<Card
							key={`${group[0]}${index}`}
							home={getFlag(match.home)}
							away={getFlag(match.away)}
							homeScore={<Typography>{group[1][index * 2]}</Typography>}
							awayScore={<Typography>{group[1][index * 2 + 1]}</Typography>}
						/>
					);
				});
				betsJSX.push(
					<div
						style={{
							color: '#e9e9e9',
							backgroundColor: '#e9e9e9',
							height: 15
						}}
					/>
				);
			}
		);
		return betsJSX;
	};

	return (
		<div>
			<div key={'listGroups'}>{listBets()}</div>
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
		textAlign: 'center',
		alignItems: 'center',
		justifyContent: 'center'
	}
}));

export default connect(null, { setTitle })(PlayerBets);
