import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import {
	setTitle,
	getMatches,
	getUserGroup,
	getUserUid,
} from '../redux/actions';
import { makeStyles, Typography, Grid } from '@material-ui/core';
import _ from 'lodash';
import { getFlag, convertFinals, groupKeys } from '../utils/utils';
import Card from './Card';
import PointCircle from './PointCircle';
import HorizontalDivider from './HorizontalDivider';
import HeaderDivider from './HeaderDivider';

const useStyles = makeStyles(() => ({
	textStyle: {
		display: 'flex',
		textAlign: 'center',
		alignItems: 'center',
		justifyContent: 'center',
		fontVariant: 'small-caps',
	},
	row: {
		direction: 'row',
		display: 'flex',
	},
	pointsCentered: {
		display: 'flex',
		textAlign: 'center',
		alignItems: 'center',
		justifyContent: 'center',
	},
	gridStyle: {
		flexBasis: '0%',
	},
}));

const PlayerBets = (props) => {
	const classes = useStyles();
	const { user } = props.props.location.state;
	// Find group members
	useEffect(() => {
		props.setTitle(user.username);
	}, [props, user]);

	const listBets = () => {
		const betsJSX = [];
		_.toPairs(_.pick(props.getUserGroup[user.id], groupKeys)).forEach(
			(group, index) => {
				betsJSX.push(
					<HeaderDivider key={'header ' + index} className={classes.textStyle}>
						{group[0].length === 1
							? `Lohko ${group[0]}`
							: convertFinals(group[0])}
					</HeaderDivider>
				);
				props.getMatches[group[0]].forEach((match, index) => {
					betsJSX.push(
						<Grid
							key={`grid ${group[0]}${index}`}
							container
							className={classes.row}
						>
							<Grid item xs={10}>
								<Card
									home={getFlag(match.home)}
									away={getFlag(match.away)}
									homeScore={<Typography>{group[1][index * 2]}</Typography>}
									awayScore={<Typography>{group[1][index * 2 + 1]}</Typography>}
								/>
							</Grid>
							<Grid item xs={2} className={classes.pointsCentered}>
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
				if (
					_.values(_.pick(props.getUserGroup[user.id], groupKeys)).length - 1 >
					index
				) {
					betsJSX.push(<HorizontalDivider key={'divider ' + index} />);
				}
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

const mapStateToProps = (state) => {
	return {
		getMatches: getMatches(state),
		getUserGroup: getUserGroup(state),
		getUserUid: getUserUid(state),
	};
};

export default connect(mapStateToProps, { setTitle })(PlayerBets);
