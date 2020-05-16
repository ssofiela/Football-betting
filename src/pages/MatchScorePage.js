import React from 'react';
import { withFirebase } from '../components/Firebase';
import MatchScore from '../components/MatchScore';

const MatchScorePage = props => (
	<div>
		<MatchScoreFirebase state={props} />
	</div>
);

const MatchScoreFirebase = withFirebase(MatchScore);

export default MatchScorePage;
