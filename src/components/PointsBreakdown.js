import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { getMatches, getUserGroup, getUserUid } from '../redux/actions';
import { countPoints } from '../utils/utils';
import { pointsBreakdown } from '../utils/stats';
import {
	makeStyles,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
	headCell: {
		fontWeight: 'bold',
		fontVariant: 'small-caps',
	},
	currentUser: {
		fontWeight: 'bold',
		backgroundColor: 'aliceblue',
	},
	three: { color: theme.palette.points.rightAnswer, fontWeight: 'bold' },
	one: { color: theme.palette.points.rightAnswer },
	zero: { color: theme.palette.points.wrongAnswer },
	total: { fontWeight: 'bold' },
}));

const PointsBreakdown = (props) => {
	const classes = useStyles();

	const rows = _.values(props.getUserGroup)
		.map((user) => {
			const { zero, one, three } = pointsBreakdown(user, props.getMatches);
			return {
				id: user.id,
				name: user.name ? user.name : 'Anonymous',
				three,
				one,
				zero,
				total: countPoints(user, props.getMatches),
			};
		})
		.sort((a, b) => b.total - a.total);

	return (
		<Table size="small">
			<TableHead>
				<TableRow>
					<TableCell className={classes.headCell}>Nimi</TableCell>
					<TableCell className={classes.headCell} align="center">
						3p
					</TableCell>
					<TableCell className={classes.headCell} align="center">
						1p
					</TableCell>
					<TableCell className={classes.headCell} align="center">
						0p
					</TableCell>
					<TableCell className={classes.headCell} align="center">
						Yhteensä
					</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{rows.map((row) => (
					<TableRow
						key={row.id}
						className={row.id === props.getUserUid ? classes.currentUser : ''}
					>
						<TableCell>{row.name}</TableCell>
						<TableCell align="center" className={classes.three}>
							{row.three}
						</TableCell>
						<TableCell align="center" className={classes.one}>
							{row.one}
						</TableCell>
						<TableCell align="center" className={classes.zero}>
							{row.zero}
						</TableCell>
						<TableCell align="center" className={classes.total}>
							{row.total}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};

const mapStateToProps = (state) => {
	return {
		getMatches: getMatches(state),
		getUserGroup: getUserGroup(state),
		getUserUid: getUserUid(state),
	};
};

export default connect(mapStateToProps, null)(PointsBreakdown);
