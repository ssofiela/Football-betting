import React from 'react';

const GroupList = props => {
	const listGroups = () => {
		return props.firebase
			.matches()
			.get()
			.then(querySnapshot => {
				return querySnapshot.docs.map(doc => {
					console.log(doc.data());
				});
			});
	};

	return (
		<div>
			<button onClick={() => listGroups()}>CLICK ME</button>
		</div>
	);
};

const createGroupItem = item => {
	return <li onClick={() => console.log(item.data())}></li>;
};

export default GroupList;
