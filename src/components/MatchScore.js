import React, {useState, useEffect} from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import {makeStyles, Typography} from '@material-ui/core';
import _ from 'lodash';
import {getFlag, getPoints} from '../utils/utils';
import Card from './Card';
import CircularProgress from "@material-ui/core/CircularProgress";

const MacthScore = state => {
    const styles = useStyles();
    const [groupMembers, setGroupMembers] = React.useState([]);
    const [currentUser, setCurrentUser] = React.useState('');
    const [groupBets, setGroupBets] = React.useState([]);
    const [groupNames, setGroupNames] = React.useState([]);
    const [groups, setGroups] = useState({});

    // Find group members
    useEffect(() => {
        const currentUser = state.firebase.getCurrentUser().uid;
        setCurrentUser(currentUser);
        const findGroupMembers = async () => {
            let groups = await state.firebase
                .userGroups()
                .get()
                .then(querySnapshot => {
                    return _.groupBy(querySnapshot.docs, item => item.data().userIds);
                });
            const list = groups;
            let group = [];
            for (let i = 0; i < Object.keys(list).length; i++) {
                const newList = Object.keys(list)[i].split(',');
                if (newList.includes(currentUser)) {
                    group = newList;
                    setGroupMembers(newList);
                }
            }
            let users = await state.firebase
                .users()
                .get()
                .then(querySnapshot => {
                    return _.fromPairs(
                        querySnapshot.docs.map(item => [item.id, item.data()])
                    );
                });
            let names = [];
            for (let j = 0; j < group.length; j++) {
                for (let z = 0; z < Object.keys(users).length; z++) {
                    if (Object.keys(users)[z] === group[j]) {
                        names.push(Object.values(users)[z].name);
                    }
                }
            }
            let matches = await state.firebase
                .matches()
                .get()
                .then(querySnapshot => {
                    return _.groupBy(
                        querySnapshot.docs.map(item => item.data()),
                        item => item.group
                    );
                });
            setGroups(matches);
            setGroupNames(names);
        };
        findGroupMembers();

        const fetchGroupBets = async () => {
            await state.firebase
                .users()
                .get()
                .then(users => {
                    const groupName = _.find(
                        users.docs,
                        item => item.id === currentUser
                    ).data().userGroup;
                    const userGroup = _.filter(
                        users.docs,
                        item => item.data().userGroup === groupName
                    );
                    setGroupBets(
                        _.fromPairs(
                            _.map(userGroup, item => [
                                item.id,
                                {
                                    bets: item.data()[state.state.location.state.groupChar],
                                    name: item.data().name
                                }
                            ])
                        )
                    );
                });
        };
        fetchGroupBets();
    }, []);

    const calculatePoints = (index, homeScore, awayScore) => {
        const char = state.state.location.state.groupChar;
        const rightGame = groups[char][index]
        const rightHomeScore = rightGame.homeScore;
        const rightAwayScore = rightGame.awayScore;
        return getPoints(homeScore, awayScore, rightHomeScore, rightAwayScore)
    };

    const listGroups = () => {
        const groupJSX = [];
        let resultFound = true;
        if (Object.keys(groups).length > 0) {
            for (let j = 0; j < Object.keys(groupBets).length; j++) {
                groupJSX.push(
                    <p className={styles.center} key={j}>
                        {Object.values(groupBets)[j].name}
                    </p>
                );
                if (_.values(groupBets)[j].bets === undefined) {
                    groupJSX.push(
                        <p className={styles.center}>Käyttäjä ei ole veikannut vielä</p>
                    );
                } else {

                    for (let i = 0; i < state.state.location.state.matches.length; i++) {
                        // Check if the game is end
                        const rightGame = groups[state.state.location.state.groupChar][i]
                        if (rightGame.homeScore === -1 || rightGame.awayScore === -1) {
                            resultFound = false;
                        }
                        groupJSX.push(
                            <Grid key={`grid ${i}, ${j}`} container style={{direction: 'row', display: 'flex'}}>
                                <Grid item xs={!resultFound ? 12 : 10}>
                                    <Card
                                        key={`${Object.values(groupBets)[j].name} ${i}`}
                                        home={getFlag(state.state.location.state.matches[i].home)}
                                        away={getFlag(state.state.location.state.matches[i].away)}
                                        homeScore={
                                            <Typography>{_.values(groupBets)[j].bets[i * 2]}</Typography>
                                        }
                                        awayScore={
                                            <Typography>
                                                {_.values(groupBets)[j].bets[i * 2 + 1]}
                                            </Typography>
                                        }
                                    />
                                </Grid>
                                {resultFound &&
                                <Grid item xs={1}>
                                    <Paper key={`Points ${i}`} elevation={3} style={{
                                        marginTop: '30px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        textAlign: 'center'
                                    }}>
                                        <div
                                            style={{padding: 5}}>{!_.isEmpty(groups) && calculatePoints(i, _.values(groupBets)[j].bets[i * 2], _.values(groupBets)[j].bets[i * 2 + 1])}</div>
                                    </Paper>

                                </Grid>
                                }
                            </Grid>
                        );
                    }

                }
            }
        } else {
            groupJSX.push(
                <div key={'inProgress'}>
                    <Grid container justify="center" alignItems="center">
                        <Grid item>
                            <CircularProgress color="secondary" />
                        </Grid>
                    </Grid>
                </div>
                )
        }

        return groupJSX;
    };

    return (
        <div>
            <div key={'listGroups'}>{!_.isEmpty(groupBets) && listGroups()}</div>
        </div>
    );
};

const useStyles = makeStyles(theme => ({
    groupContainer: {
        margin: '20px',
        height: 50
    },
    root: {
        '& .MuiTextField-root': {
            maxWidth: 100
        }
    },
    submit: {
        margin: theme.spacing(3, 0, 2)
    },
    center: {
        display: 'flex',
        margin: '10px',
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center'
    }
}));

export default MacthScore;
