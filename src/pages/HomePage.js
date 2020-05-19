import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { setTitle } from '../redux/actions';
import GroupList from '../components/GroupList';
import Scoreboard from '../components/Scoreboard';
import { withRouter } from 'react-router-dom';
import data from './../data/matches.json';

const HomePage = (props) => {
	useEffect(() => {
		props.setTitle('em-kisaveikkaus');

		//writeDB();
	}, [props]);

	const writeDB = () => {
		for (let i = 0; i < data.matches.length; i++) {
			props.firebase.matches().doc(i.toString()).set(data.matches[i]);
		}
	};

	return (
		<div>
			<ScoreboardRouter />
			<GroupList />
		</div>
	);
};

const ScoreboardRouter = withRouter(Scoreboard);

export default connect(null, {
	setTitle,
})(HomePage);
