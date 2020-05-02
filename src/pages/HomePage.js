import React from 'react';
import GroupList from '../components/GroupList';
import Scoreboard from '../components/Scoreboard';
import { withFirebase } from '../components/Firebase';
import { withRouter } from 'react-router-dom';

const HomePage = () => (
	<div>
		<ScoreboardFirebase />
		<GroupListFirebase />
	</div>
);

const GroupListFirebase = withFirebase(GroupList);
const ScoreboardFirebase = withFirebase(withRouter(Scoreboard));

export default HomePage;
