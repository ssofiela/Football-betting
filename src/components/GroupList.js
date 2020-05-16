import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { getMatches, getUserGroup, getUserUid } from '../redux/actions';
import _ from 'lodash';
import GroupListItem from './GroupListItem';
import { withRouter } from 'react-router';
import data from './../data/matches.json';

const GroupList = props => {
	const [bettedGroups, setBettedGroups] = useState([]);

	useEffect(() => {
		let bettedGroups = _.keys(
			_.find(props.getUserGroup, user => user.id === props.getUserUid)
		).filter(key => _.includes('ABCDEF', key));

		setBettedGroups(bettedGroups);
	}, []);

	const listGroups = () => {
		const groupJSX = [];
		const groupsArray = _.sortBy(
			Object.entries(props.getMatches),
			group => group[0]
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

	const writeDB = () => {
		for (let i = 0; i < data.matches.length; i++) {
			props.firebase
				.matches()
				.doc(i.toString())
				.set(data.matches[i]);
		}
	};

	return <div>{listGroups()}</div>;
};

const GroupListItemWithRouter = withRouter(GroupListItem);

const mapStateToProps = state => {
	return {
		getMatches: getMatches(state),
		getUserGroup: getUserGroup(state),
		getUserUid: getUserUid(state)
	};
};

export default connect(mapStateToProps, null)(GroupList);
