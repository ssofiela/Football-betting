import _ from "lodash";
import Paper from "@material-ui/core/Paper";
import React, {useEffect} from "react";
import {getPoints} from "../utils/utils";
import {makeStyles} from "@material-ui/core";

const useStyles = makeStyles(theme => ({
    points: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '20px',
        height: '44px',
        width: '44px',
        borderRadius: '50%',
        borderStyle: 'solid',
        borderWidth: '3px',
    },
    rightAns:{
        backgroundColor: theme.palette.points.rightAnswer,
        borderColor: theme.palette.chipColor.gold,
    },
    rightWin: {
        backgroundColor: theme.palette.points.rightAnswer,
        borderColor: theme.palette.points.rightAnswer,
    },
    wrongAns: {
        backgroundColor: theme.palette.points.wrongAnswer,
        borderColor: theme.palette.points.wrongAnswer,
    }

}));

const PointCircle = props => {
    const styles = useStyles();
    const [points, setPoints] = React.useState('');

    useEffect(() => {
        const calculatePoints = (index, homeScore, awayScore) => {
            console.log("props,", props)
            const char = props.groupChar;
            const rightGame = props.groups[char][index];
            const rightHomeScore = rightGame.homeScore;
            const rightAwayScore = rightGame.awayScore;
            const value = getPoints(homeScore, awayScore, rightHomeScore, rightAwayScore);
            setPoints(value)
        };
        calculatePoints(props.index, props.homeScore, props.awayScore);
    }, []);

    return (<Paper
        key={`Points ${props.key}`}
        elevation={3}
        className={[styles.points, points === 3? styles.rightAns : points === 1 ? styles.rightWin : styles.wrongAns].join(' ')}
    >
        <div style={{justifyContent: 'center', alignItems: 'center', color: 'white'}}>
            {`${points}p` }
        </div>
    </Paper>)
}

export default PointCircle