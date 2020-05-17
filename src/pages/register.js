import React from 'react';
import {withFirebase} from '../components/Firebase';
import SignUpForm from '../components/SignIn/SignUpForm.js'
import {withRouter} from 'react-router-dom'



export default function Register() {
   return (
       <div>
          <SignUpFormFirebase/>
       </div>

   )

}

const SignUpFormFirebase = withFirebase(withRouter(SignUpForm));
