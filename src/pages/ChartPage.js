import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { setTitle, setUserGroup, getUserGroup, getMatches, getUserUid } from '../redux/actions';
import { makeStyles } from '@material-ui/core';
import _ from 'lodash';
import 'chart.js/auto';
import { Chart } from "react-chartjs-2"

import { getPoints, groupKeys } from '../utils/utils';
import HeaderComponent from '../components/HeaderComponent';

const colors = ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#000']

const useStyles = makeStyles((theme) => ({
	submit: {
		margin: theme.spacing(3, 0, 2),
		fontVariant: 'small-caps',
	},
	center: {
		textAlign: 'center',
	},
}));

const ChartPage = (props) => {
	const classes = useStyles();
	//const { groupChar, matches } = props.state.location.state;
    const [lineData, setLineData] = useState([]);

	useEffect(() => {
		props.setTitle('Tilastot');
        const currentUser = props.getUserGroup[props.getUserUid];
        const data = _.values(
            _.pickBy(
                props.getUserGroup,
                (item) => item.userGroup === currentUser.userGroup
            )
        ).map((user, id) => {
            return {
                id,
                label: user.name ? user.name : 'Anonymous',
                data: pointsByMatch(user),
                backgroundColor: colors[id],
                borderColor: colors[id]
            };
        })
        setLineData(data)
	}, [props]);

    const pointsByMatch = (user) => {
        let dataPoints = []
        let cumulativePoints = 0
        for (let groupChar of groupKeys) {
            const userBets = user[groupChar];
            if (userBets) {
                props.getMatches[groupChar].forEach((match, index) => {
                    if(match.homeScore != -1 && match.awayScore != -1) {

                        cumulativePoints += getPoints(
                            userBets[index * 2],
                            userBets[index * 2 + 1],
                            match.homeScore,
                            match.awayScore,
                            match.id
                        )
                        dataPoints.push(cumulativePoints)
                    }
                });
            }
        }
        console.log(_.sortBy(dataPoints, 'id'))
        return _.sortBy(dataPoints, 'id')
    }

	return (
		<div>
			<HeaderComponent
				backgroundColor={true}
				name='Tilastot'
			/>
			<div>
                <Chart
                    type='line'
                    data={{
                        labels: [...Array(lineData[0] != undefined ? lineData[0].data.length : 0).keys()],
                        datasets: lineData,
                    }}
                    
                />
            </div>
			
		</div>
	);
};

const mapStateToProps = (state) => {
	return {
		getMatches: getMatches(state),
		getUserGroup: getUserGroup(state),
		getUserUid: getUserUid(state),
	};
};

export default connect(mapStateToProps, { setTitle, setUserGroup })(ChartPage);
