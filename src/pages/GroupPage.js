import React from 'react';
import GroupList from '../components/GroupList';
import { withFirebase } from '../components/Firebase';

const GroupPage = () => (
	<div>
		<GroupListFirebase />
	</div>
);

const GroupListFirebase = withFirebase(GroupList);

export default GroupPage;
