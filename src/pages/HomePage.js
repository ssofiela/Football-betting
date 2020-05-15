import React from 'react';
import GroupList from '../components/GroupList';
import Scoreboard from '../components/Scoreboard';
import HeaderComponent from '../components/HeaderComponent';
import { withFirebase } from '../components/Firebase';
import { withRouter } from 'react-router-dom';

const HomePage = () => (
	<div>
		<HeaderComponentFirebase />
		<ScoreboardFirebase />
		<GroupListFirebase />
	</div>
);

const HeaderComponentFirebase = withFirebase(HeaderComponent);
const GroupListFirebase = withFirebase(GroupList);
const ScoreboardFirebase = withFirebase(withRouter(Scoreboard));

export default HomePage;
