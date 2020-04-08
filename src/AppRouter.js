import React, {useState, useEffect} from 'react';
import Register from '../src/pages/register.js';
import Login from '../src/pages/login.js';
import {
    Switch,
    Route,
    Redirect,
    withRouter, BrowserRouter as Router
} from 'react-router-dom';
import GroupPage from './pages/GroupPage';
import BetPage from './pages/BetPage';
import StatsPage from './pages/StatsPage';
import MatchScorePage from './pages/MatchScorePage';
import {withFirebase} from "./components/Firebase";
import TopBar from "./components/TopBar";
import BottomNav from "./components/BottomNav";
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';

export default function AppRouter(props) {

    const [userAuth, setAuth] = useState(false);
    const [indicator, setIndicator] = useState(true);

    // Check authentication
    useEffect(() => {
        //setIndicator(true);
        props.firebase.auth.onAuthStateChanged(function (user) {
            setAuth(user);
            setIndicator(false);
        });
    }, []);

    // If user is not authenticated, she/he can only log in/register
    const authCheck = () => {
        let value = [];
        if (!userAuth) {

            value.push(
                <Switch key='notAuth'>
                    <Route key="register" exact path="/register" component={Register} />
                    <Route key="login" exact path="/login" component={Login} />
                    <Redirect to='/login'/>
                </Switch>
            )
        } else {
            value.push(
                <Switch key='auth'>
                    <Route key="stats" exact path="/tulokset" component={StatsPage} />
                    <Route key="match" exact path="/matsi" component={MatchScorePage} />
                    <Route key="bet" exact path="/veikkaa" component={BetPage} />
                    <Route key="home" exact path="/" component={GroupPageWithNav} />
                    <Redirect to='/'/>
                </Switch>
            )
        }
        return value;
    };

    return (

        <Router>
            <TopBarWithRouter/>
            {indicator ?
                <div>
                    <Grid container justify='center'
                          alignItems='center'>
                        <Grid item>
                            <CircularProgress color='secondary'/>
                        </Grid>
                    </Grid>
                </div>
                :
                authCheck()
            }
        </Router>
    );

}

const GroupPageWithNav = withRouter(GroupPage);
const TopBarWithRouter = withFirebase(withRouter(TopBar));
const BottomNavWithRouter = withRouter(BottomNav);

