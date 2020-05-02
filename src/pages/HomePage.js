import React from 'react';
import GroupList from '../components/GroupList';
import Scoreboard from '../components/Scoreboard';
import { withFirebase } from '../components/Firebase';

const HomePage = () => (
	<div>
		<ScoreboardFirebase />
		<GroupListFirebase />
	</div>
);

const GroupListFirebase = withFirebase(GroupList);
const ScoreboardFirebase = withFirebase(Scoreboard);

export default HomePage;
