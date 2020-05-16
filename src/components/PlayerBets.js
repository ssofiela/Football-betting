import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import {
	setTitle,
	getMatches,
	getUserGroup,
	getUserUid
} from '../redux/actions';
import { makeStyles, Typography, Grid } from '@material-ui/core';
import _ from 'lodash';
import { getFlag } from '../utils/utils';
import Card from './Card';
import PointCircle from './PointCircle';
import HorizontalDivider from './HorizontalDivider';

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
				const resultFound = match.homeScore >= 0 && match.awayScore >= 0;
				betsJSX.push(
					<Grid
						key={`grid ${group[0]}${index}`}
						container
						style={{ direction: 'row', display: 'flex' }}
					>
						<Grid item xs={10}>
							<Card
								key={`${group[0]}${index}`}
								home={getFlag(match.home)}
								away={getFlag(match.away)}
								homeScore={<Typography>{group[1][index * 2]}</Typography>}
								awayScore={<Typography>{group[1][index * 2 + 1]}</Typography>}
							/>
						</Grid>
						<Grid item xs={2} style={{ flexBasis: '0%' }}>
							<PointCircle
								index={index}
								groups={props.getMatches}
								groupChar={group[0]}
								homeScore={group[1][index * 2]}
								awayScore={group[1][index * 2 + 1]}
							/>
						</Grid>
					</Grid>
				);
			});
			betsJSX.push(<HorizontalDivider />);
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
