import React, { useState, useEffect } from 'react';
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import {makeStyles} from "@material-ui/core";
import TextField from "@material-ui/core/TextField";

const BetList = state => {
    const styles = useStyles();

    const listGroups = () => {
        const groupJSX = [];
        for (let i = 0; i < state.state.location.state.matches.length; i++) {
            groupJSX.push(
                <Paper
                    elevation={3}
                    className={styles.groupContainer}
                >
                    <Grid container direction="row" justify="space-evenly" key={i}>
                        <form className={styles.root} noValidate autoComplete="off">
                            <div>
                                {state.state.location.state.matches[i].away}
                                <TextField
                                    required
                                    name="bet"
                                    type="number"
                                    id="bet"
                                    inputProps={{min: 0, style: { textAlign: 'center' }}}
                                />
                                -
                                <TextField
                                    required
                                    name="bet"
                                    type="number"
                                    id="bet"
                                    inputProps={{min: 0, style: { textAlign: 'center' }}}
                                />
                                {state.state.location.state.matches[i].home}
                            </div>
                        </form>
                    </Grid>
                </Paper>
            );
        }
        return groupJSX;
    };

    return (
        <div key={'listGroups'}>{listGroups()}</div>
    )
};


const useStyles = makeStyles(theme => ({
    groupContainer: { margin: '20px' },
    root: {
        '& .MuiTextField-root': {
            maxWidth: 100,
        },
    },
}));


export default BetList;
