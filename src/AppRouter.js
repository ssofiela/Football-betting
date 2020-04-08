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
import StatsPage from './pages/StatsPage';
import BetPage from './pages/BetPage';
import {withFirebase} from "./components/Firebase";
import TopBar from "./components/TopBar";
import BottomNav from "./components/BottomNav";

export default function AppRouter(props) {
    const [userAuth, setAuth] = useState(false);

    useEffect(() => {
        props.firebase.auth.onAuthStateChanged(function (user) {
            setAuth(user);
        });
    }, []);

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
                <TopBarWithRouter />
                {authCheck()}
                <BottomNavWithRouter />
            </Router>
        );
}

const GroupPageWithNav = withRouter(GroupPage);
const TopBarWithRouter = withFirebase(withRouter(TopBar));
const BottomNavWithRouter = withRouter(BottomNav);

