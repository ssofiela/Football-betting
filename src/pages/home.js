import React from 'react';
import { Link } from 'react-router-dom'
import Button from "@material-ui/core/Button";

class Home extends React.Component {

    render() {
        return (

            <div>
                <div>home page</div>
                <Link to="/register">Register</Link>
                <Link to="/login">Login</Link>

            </div>
        )
    }
}

export default Home;