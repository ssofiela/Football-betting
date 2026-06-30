import _ from 'lodash';

// Fetches users and matches from Firestore and returns
// { users, matches } where users is filtered to the current user's group
// and matches are grouped by group code, each group's array sorted by id.
export const loadLeagueData = (firebase) => {
	return Promise.all([
		firebase
			.users()
			.get()
			.then((querySnapshot) => {
				return _.fromPairs(
					querySnapshot.docs.map((user) => [
						user.id,
						{ ...user.data(), id: user.id },
					])
				);
			}),
		firebase
			.matches()
			.get()
			.then((querySnapshot) => {
				const grouped = _.groupBy(
					querySnapshot.docs.map((item) => item.data()),
					(item) => item.group
				);
				return _.mapValues(grouped, (arr) => _.sortBy(arr, 'id'));
			}),
	]).then((results) => {
		const uid = firebase.getCurrentUser().uid;
		const users = _.pickBy(
			results[0],
			(user) => user.userGroup === results[0][uid].userGroup
		);
		return { users, matches: results[1] };
	});
};
