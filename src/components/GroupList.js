import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { getMatches, getUserGroup, getUserUid } from '../redux/actions';
import _ from 'lodash';
import GroupListItem from './GroupListItem';
import { withRouter } from 'react-router';

const groupOrderRef = [
	'A',
	'B',
	'C',
	'D',
	'E',
	'F',
	'rof16',
	'rof8',
	'rof4',
	'rof2',
];

const GroupList = (props) => {
	const [bettedGroups, setBettedGroups] = useState([]);

	useEffect(() => {
		console.log(props.getUserGroup);
		console.log(props.getUserUid);
		let bettedGroups = _.keys(
			_.find(props.getUserGroup, (user) => user.id === props.getUserUid)
		).filter((key) => _.includes('ABCDEF', key));
		console.log(bettedGroups);
		setBettedGroups(bettedGroups);
	}, [props]);

	const listGroups = () => {
		const groupJSX = [];
		const groupsArray = Object.entries(props.getMatches).sort(
			(a, b) => groupOrderRef.indexOf(a[0]) - groupOrderRef.indexOf(b[0])
		);
		for (const [key, value] of groupsArray) {
			groupJSX.push(
				<GroupListItemWithRouter
					key={key}
					groupChar={key}
					groupMatches={value}
					needBet={!_.includes(bettedGroups, key)}
				/>
			);
		}
		return groupJSX;
	};

	return <div>{listGroups()}</div>;
};

const GroupListItemWithRouter = withRouter(GroupListItem);

const mapStateToProps = (state) => {
	return {
		getMatches: getMatches(state),
		getUserGroup: getUserGroup(state),
		getUserUid: getUserUid(state),
	};
};

export default connect(mapStateToProps, null)(GroupList);
