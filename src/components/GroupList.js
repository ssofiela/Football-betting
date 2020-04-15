import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import GroupListItem from './GroupListItem';
import { withRouter } from 'react-router';
import data from './../data/matches.json';

const GroupList = props => {
	const [groups, setGroups] = useState({});
	const [bettedGroups, setBettedGroups] = useState([]);

	useEffect(() => {
		const fetchGroups = async () => {
			let groups = await props.firebase
				.matches()
				.get()
				.then(querySnapshot => {
					return _.groupBy(querySnapshot.docs, item => item.data().group);
				});
			let bettedGroups = await props.firebase
				.users()
				.get()
				.then(querySnapshot => {
					return _.keys(
						_.find(
							querySnapshot.docs,
							item => item.id === props.firebase.getCurrentUser().uid
						).data()
					).filter(key => key.length === 1);
				});

			console.log(groups);
			setBettedGroups(bettedGroups);
			setGroups(groups);
		};
		fetchGroups();
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
