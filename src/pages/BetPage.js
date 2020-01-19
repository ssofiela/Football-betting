import React from 'react';

const BetPage = props => {
	return (
		<button onClick={() => console.log(props.location.state)}>
			veikkaukset tänne
		</button>
	);
};

export default BetPage;
