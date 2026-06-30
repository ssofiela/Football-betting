import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { getMatches, getUserGroup, getUserUid } from '../redux/actions';
import { cumulativeSeries } from '../utils/stats';
import {
	ResponsiveContainer,
	LineChart,
	Line,
	XAxis,
	YAxis,
	Legend,
	Tooltip,
	CartesianGrid,
} from 'recharts';

// A small palette of distinct colors cycled across the user lines.
const COLORS = [
	'#27496d',
	'#c70d3a',
	'#1f6650',
	'#e08a00',
	'#7b2cbf',
	'#0096c7',
	'#d62246',
	'#588157',
	'#bc6c25',
	'#3a0ca3',
];

const PointsChart = (props) => {
	const { rows, userNames } = cumulativeSeries(
		props.getUserGroup,
		props.getMatches
	);

	// Map the current user's uid to its position in the series so its line can
	// be emphasised with a thicker stroke.
	const userList = _.values(props.getUserGroup);
	const currentIndex = userList.findIndex(
		(user) => user.id === props.getUserUid
	);
	const currentUserName = userNames[currentIndex];

	// Print the phase label only at the first match of each round.
	const renderTick = ({ x, y, payload }) => {
		const row = rows[payload.index];
		const prev = rows[payload.index - 1];
		if (row && (!prev || prev.phase !== row.phase)) {
			return (
				<text x={x} y={y + 12} textAnchor="start" fontSize={11} fill="#666">
					{row.phase}
				</text>
			);
		}
		return null;
	};

	return (
		<ResponsiveContainer width="100%" height={360}>
			<LineChart data={rows} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey="matchup" tick={renderTick} interval={0} />
				<YAxis allowDecimals={false} />
				<Tooltip />
				<Legend />
				{userNames.map((name, index) => (
					<Line
						key={name}
						type="monotone"
						dataKey={name}
						stroke={COLORS[index % COLORS.length]}
						strokeWidth={name === currentUserName ? 3 : 1.5}
						dot={false}
						isAnimationActive={false}
					/>
				))}
			</LineChart>
		</ResponsiveContainer>
	);
};

const mapStateToProps = (state) => {
	return {
		getMatches: getMatches(state),
		getUserGroup: getUserGroup(state),
		getUserUid: getUserUid(state),
	};
};

export default connect(mapStateToProps, null)(PointsChart);
