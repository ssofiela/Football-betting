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
import { getFlag } from '../utils/utils';
import Card from './Card';
import PointCircle from './PointCircle';
import HorizontalDivider from './HorizontalDivider';

const useStyles = makeStyles((theme) => ({
	textStyle: {
		display: 'flex',
		textAlign: 'center',
		alignItems: 'center',
		justifyContent: 'center',
		fontVariant: 'small-caps',
	},
}));

const PlayerBets = (props) => {
	const classes = useStyles();
	const { user } = props.props.location.state;
	const showMatchGroups = ['A', 'B', 'C', 'D', 'E', 'F'];
	// Find group members
	useEffect(() => {
		props.setTitle(user.username);
	}, [props, user]);

	const listBets = () => {
		const betsJSX = [];
		_.toPairs(_.pick(props.getUserGroup[user.id], showMatchGroups)).forEach(
			(group, index) => {
				betsJSX.push(
					<h3
						key={'header ' + index}
						className={classes.textStyle}
					>{`Lohko ${group[0]}`}</h3>
				);
				props.getMatches[group[0]].forEach((match, index) => {
					betsJSX.push(
						<Grid
							key={`grid ${group[0]}${index}`}
							container
							style={{ direction: 'row', display: 'flex' }}
						>
							<Grid item xs={10}>
								<Card
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
				if (
					_.values(_.pick(props.getUserGroup[user.id], showMatchGroups))
						.length -
						1 >
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
