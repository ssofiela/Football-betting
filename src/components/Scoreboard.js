import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import GroupListItem from './GroupListItem';
import { withRouter } from 'react-router';
import data from './../data/matches.json';

const Scoreboard = props => {
	const [groups, setGroups] = useState({});
	const [scoreboard, setScoreBoard] = useState([]);

	useEffect(() => {
		const fetchGroups = async () => {
			let matches = await props.firebase
				.matches()
				.get()
				.then(querySnapshot => {
					return _.groupBy(
						querySnapshot.docs.map(item => item.data()),
						item => item.group
					);
				});
			let users = await props.firebase
				.users()
				.get()
				.then(querySnapshot => {
					return querySnapshot.docs.map(item => item.data());
				});
			const scoreboard = _.sortBy(
				users.map(user => {
					return { points: countPoints(user, matches), username: 'asd' };
				}),
				['points']
			).reverse();

			setGroups(matches);
			setScoreBoard(scoreboard);
		};
		fetchGroups();
	}, []);

	const countPoints = (user, matches) => {
		const groupChars = 'ABCDEF';
		let points = 0;
		for (let groupChar of groupChars) {
			const userBets = user[groupChar];
			matches[groupChar].forEach((match, index) => {
				if (
					match.homeScore >= 0 &&
					match.awayScore >= 0 &&
					userBets[index] >= 0 &&
					userBets[index + 1] >= 0
				)
					if (
						(match.homeScore - match.awayScore) *
							(userBets[index] - userBets[index + 1]) >
							0 ||
						match.homeScore - match.awayScore ==
							userBets[index] - userBets[index + 1]
					) {
						if (
							match.homeScore == userBets[index] &&
							match.awayScore == userBets[index + 1]
						) {
							points += 3;
						} else {
							points += 1;
						}
					}
			});
		}
		return points;
	};

	const getScoreboard = () => {
		console.log(scoreboard);
		return scoreboard.map(user => (
			<p>
				{user.username}: {user.points}
			</p>
		));
	};

	return <div>{getScoreboard()}</div>;
};

export default Scoreboard;
