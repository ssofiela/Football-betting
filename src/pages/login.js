import React from 'react';
import {withFirebase} from "../components/Firebase";
import SignInForm from "../components/SignIn/SignInForm.js"
import {withRouter} from 'react-router-dom'



export default function Register() {
    return (
        <div>
            <SignInFormFirebase/>
        </div>

    )

}

const SignInFormFirebase = withFirebase(withRouter(SignInForm));

