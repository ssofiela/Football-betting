import app from 'firebase/app';
import 'firebase/firestore';

export const config = {
	apiKey: process.env.REACT_APP_API_KEY,
	authDomain: process.env.REACT_APP_AUTH_DOMAIN,
	databaseURL: process.env.REACT_APP_DATABASE_URL,
	projectId: process.env.REACT_APP_PROJECT_ID,
	storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
	messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
	appId: process.env.REACT_APP_APP_ID
};

class Firebase {
	constructor() {

		app.initializeApp(config)

		this.db = app.firestore();
		this.auth = app.auth();
	}

	// *** Auth API ***

	doCreateUserWithEmailAndPassword = (email, password) =>
		this.auth.createUserWithEmailAndPassword(email, password);
	doSignInWithEmailAndPassword = (email, password) =>
		this.auth.signInWithEmailAndPassword(email, password);
	doSignOut = () => this.auth.signOut();
	doPasswordReset = email => this.auth.sendPasswordResetEmail(email);
	doPasswordUpdate = password =>
		this.auth.currentUser.updatePassword(password);


	users = () => this.db.collection('users');
	matches = () => this.db.collection('matches');

}

export default Firebase;
