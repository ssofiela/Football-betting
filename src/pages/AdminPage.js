import { makeStyles, Button, TextField } from '@material-ui/core';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { withFirebase } from '../components/Firebase';

const useStyles = makeStyles((theme) => ({
	submit: {
		margin: theme.spacing(3, 0, 2),
		fontVariant: 'small-caps',
	},
	center: {
		textAlign: 'center',
	},
}));

const Admin = (props) => {
	const classes = useStyles();
	const [matches, setMatches] = useState([]);
	const [render, rerender] = useState(0);

	useEffect(() => {
		const fetchMatches = async () => {
			const data = await props.firebase
				.matches()
				.get()
				.then((querySnapshot) => {
					return _.groupBy(
						querySnapshot.docs.map((item) => item.data()),
						(item) => item.group
					);
				});
			setMatches(data);
		};
		fetchMatches();
	}, []);

	const sendMatches = () => {
		console.log(matches);
		const matchArr = _.matches;
		for (let i = 0; i < matches.length; i++) {
			props.firebase.matches().doc(i.toString()).set(matches[i]);
		}
		/*
		props.firebase
			.matches()
			.get()
			.then((querySnapshot) => {
				querySnapshot.forEach((doc) => {
					console.log(doc.id);
					doc.ref.update({});
				});
			});*/
	};

	const handleChange = (event, match, which) => {
		let groupMatches = matches[match.group];
		console.log(groupMatches);

		const i = groupMatches.findIndex((item) => item.id === match.id);
		let updatedMatch = groupMatches[i];
		if (which === 'home') updatedMatch.homeScore = parseInt(event.target.value);
		else if (which === 'away')
			updatedMatch.awayScore = parseInt(event.target.value);
		groupMatches[i] = updatedMatch;
		let tempMatches = matches;
		tempMatches[match.group] = groupMatches;
		setMatches(tempMatches);
		rerender((p) => p + 1);
	};

	const saveGroup = () => {
		console.log();
	};

	const getInputs = () => {
		const matchesByGroups = [];
		console.log(matches);
		_.forIn(
			_.groupBy(matches, (match) => match.group),
			(groupMatches, groupKey) => {
				matchesByGroups.push(groupMatches);
			}
		);
		return (
			<div>
				{matchesByGroups.length > 0 &&
					matchesByGroups[0].map((group) => (
						<div
							style={{
								flex: 1,
								backgroundColor: 'white',
								border: '1px solid black',
								margin: 30,
								padding: 30,
							}}
						>
							{group.map((match) => (
								<div>
									<>{match.home}</>
									<TextField
										name="bet"
										type="number"
										id="bet"
										inputProps={{ min: 0, className: classes.center }}
										onChange={(event) => handleChange(event, match, 'home')}
										value={match.homeScore}
									/>
									<>-</>
									<TextField
										name="bet"
										type="number"
										id="bet"
										inputProps={{ min: 0, className: classes.center }}
										onChange={(event) => handleChange(event, match, 'away')}
										value={match.awayScore}
									/>
									<>{match.home}</>
								</div>
							))}
						</div>
					))}
			</div>
		);
	};

	return (
		<div>
			<Button onClick={sendMatches}>Tallenna</Button>
			{getInputs()}
		</div>
	);
};
export default withFirebase(Admin);
