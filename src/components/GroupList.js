import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import GroupListItem from './GroupListItem';

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
		console.log(groups);
		for (const [key, value] of Object.entries(groups)) {
			console.log(key, value);
			groupJSX.push(
				<GroupListItem key={key} groupChar={key} groupMatches={value} />
			);
		}
		return groupJSX;
	};

	return <div>{listGroups()}</div>;
};

const createGroupItem = item => {
	return <li onClick={() => console.log(item.data())}></li>;
};

export default GroupList;
