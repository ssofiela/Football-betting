import React, { useState, useEffect } from 'react';

const BetList = state => {

    const listGroups = () => {
        const groupJSX = [];
        for (let i = 0; i < state.state.location.state.matches.length; i++) {
            groupJSX.push(
                <div key={i}>
                    <div>
                        {state.state.location.state.matches[i].away}
                        -
                        {state.state.location.state.matches[i].home}
                    </div>
                </div>
            );
        }
        return groupJSX;
    };

    return <div>{listGroups()}</div>;
};


export default BetList;
