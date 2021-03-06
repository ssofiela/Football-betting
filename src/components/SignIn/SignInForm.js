import React from 'react';
import {
	Button,
	CssBaseline,
	TextField,
	Typography,
	Container,
} from '@material-ui/core/';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
	paper: {
		marginTop: theme.spacing(8),
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
	},
	form: {
		width: '100%', // Fix IE 11 issue.
		marginTop: theme.spacing(1),
	},
	submit: {
		margin: theme.spacing(3, 0, 2),
	},
}));

export default function Register(props) {
	const classes = useStyles();

	const [email, setEmail] = React.useState('');
	const [password, setPassword] = React.useState('');
	const [error, setError] = React.useState(false);

	const handleEmail = (newEmail) => {
		setEmail(newEmail);
	};
	const handlePassword = (newPassword) => {
		setPassword(newPassword);
	};

	return (
		<Container component="main" maxWidth="xs">
			<CssBaseline />
			<div className={classes.paper}>
				<Typography component="h1" variant="h4">
					Kirjaudu
				</Typography>
				<form className={classes.form} noValidate>
					<TextField
						variant="outlined"
						margin="normal"
						required
						fullWidth
						id="email"
						label="Sähköposti"
						name="email"
						autoComplete="email"
						autoFocus
						onChange={(event) => handleEmail(event.target.value)}
						error={error}
					/>
					<TextField
						variant="outlined"
						margin="normal"
						required
						fullWidth
						name="password"
						label="Salasana"
						type="password"
						id="password"
						autoComplete="current-password"
						onChange={(event) => handlePassword(event.target.value)}
						error={error}
						helperText={error ? 'Sähköposti ja salasana eivät täsmää' : null}
					/>
					<Button
						fullWidth
						variant="contained"
						color="primary"
						className={classes.submit}
						onClick={() => {
							setError(false);
							props.firebase
								.doSignInWithEmailAndPassword(email, password)
								.then(() => {
									setEmail('');
									setPassword('');
									props.history.push('/');
								})
								.catch((error) => {
									setError(true);
								});
						}}
					>
						Kirjaudu
					</Button>
					<Link to="/register">{'Uusi käyttäjä? Luo tili'}</Link>
				</form>
			</div>
		</Container>
	);
}
