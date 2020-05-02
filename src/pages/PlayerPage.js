import React from 'react';
import { withFirebase } from '../components/Firebase';
import PlayerBets from '../components/PlayerBets';

const PlayerPage = props => (
	<div>
		<PlayerBetsFirebase props={props} />
	</div>
);

const PlayerBetsFirebase = withFirebase(PlayerBets);

export default PlayerPage;
