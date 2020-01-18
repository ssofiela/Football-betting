import React from 'react';
import firebase from 'firebase';
import { config } from './components/Firebase/firebase.js';
import Register from '../src/pages/register.js'
import {
    BrowserRouter as Router,
    Switch,
    Route,
} from 'react-router-dom';
import Home from "./pages/home";

firebase.initializeApp(config);

class App extends React.Component {
    render() {
        return (
            <Router>
                    <Switch>
                        <Route key='home' exact path='/' component={Home}/>
                        <Route key='register' exact path='/register' component={Register}/>
                    </Switch>
            </Router>
        );
    }
}

export default App;
