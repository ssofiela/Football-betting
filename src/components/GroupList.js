import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import GroupListItem from './GroupListItem';
import { withRouter } from 'react-router';
import data from './../data/matches.json';

const GroupList = props => {
	const [groups, setGroups] = useState({});

	useEffect(() => {
		const asd = async () => {
			let groups = await props.firebase
				.matches()
				.get()
				.then(querySnapshot => {
					return _.groupBy(querySnapshot.docs, item => item.data().group);
				});
			console.log(groups);
			setGroups(groups);
		};
		asd();
	}, []);

	const listGroups = () => {
		const groupJSX = [];
		const groupsArray = _.sortBy(Object.entries(groups), group => group[0]);
		console.log(groupsArray);
		for (const [key, value] of groupsArray) {
			groupJSX.push(
				<GroupListItemWithRouter
					key={key}
					groupChar={key}
					groupMatches={value}
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
