import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import GroupListItem from './GroupListItem';
import { withRouter } from 'react-router';
import data from './../data/matches.json';

const GroupList = props => {
	const [groups, setGroups] = useState({});
	const [bettedGroups, setBettedGroups] = useState([]);

	useEffect(() => {
		const { users, matches, currentUserUid } = props.serverData;
		let bettedGroups = _.keys(
			_.find(users, user => user.id === currentUserUid)
		).filter(key => _.includes('ABCDEF', key));

		setGroups(matches);
		setBettedGroups(bettedGroups);
	}, []);

	const listGroups = () => {
		const groupJSX = [];
		const groupsArray = _.sortBy(Object.entries(groups), group => group[0]);
		console.log(groupsArray);
		console.log(bettedGroups);
		for (const [key, value] of groupsArray) {
			console.log(key, !_.includes(bettedGroups, key));
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

export default GroupList;
