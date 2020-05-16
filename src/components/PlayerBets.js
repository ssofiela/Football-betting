import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import {
	setTitle,
	getMatches,
	getUserGroup,
	getUserUid
} from '../redux/actions';
import { makeStyles, Typography } from '@material-ui/core';
import _ from 'lodash';
import { getFlag } from '../utils/utils';
import Card from './Card';

const PlayerBets = props => {
	const styles = useStyles();
	const { user } = props.props.location.state;

	// Find group members
	useEffect(() => {
		props.setTitle(user.username);
	}, []);

	const listBets = () => {
		const betsJSX = [];
		_.toPairs(
			_.pick(props.getUserGroup[user.id], ['A', 'B', 'C', 'D', 'E', 'F'])
		).forEach(group => {
			betsJSX.push(<h2 className={styles.center}>{`LOHKO ${group[0]}`}</h2>);
			props.getMatches[group[0]].forEach((match, index) => {
				//console.log(match);
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
		});
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

const mapStateToProps = state => {
	return {
		getMatches: getMatches(state),
		getUserGroup: getUserGroup(state),
		getUserUid: getUserUid(state)
	};
};

export default connect(mapStateToProps, { setTitle })(PlayerBets);
