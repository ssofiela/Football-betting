import React from 'react';
import {withFirebase} from "../components/Firebase";
import BetList from "../components/BetList";


const BetPage = (props) => (
	<div>
		<BetListFirebase state={props}/>
	</div>
);

const BetListFirebase = withFirebase(BetList);

export default BetPage;

