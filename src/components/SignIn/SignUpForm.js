import React from 'react';
import {
	Button,
	CssBaseline,
	TextField,
	Grid,
	Typography,
	Container,
	FormControlLabel,
	Radio,
	FormControl,
	FormLabel,
	RadioGroup,
	InputAdornment,
	IconButton,
	InputLabel,
	OutlinedInput,
	FormHelperText,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';

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
	formControl: {
		margin: theme.spacing(3),
	},
	inputField: {
		width: '100%',
		marginTop: theme.spacing(2),
	},
}));

export default function Register(props) {
	const classes = useStyles();
	const [email, setEmail] = React.useState('');
	const [password, setPassword] = React.useState('');
	const [groupName, setGroupName] = React.useState('');
	const [name, setName] = React.useState('');
	const [emailError, setEmailError] = React.useState(false);
	const [passwordError, setPasswordError] = React.useState(false);
	const [GroupNameError, setGroupNameError] = React.useState(false);
	const [helperTextAddress, setHelperTextAddress] = React.useState('');
	const [showPassword, setShowPassword] = React.useState(false);
	const [nameError, setNameError] = React.useState(false);

	const handleEmail = (newEmail) => {
		setEmail(newEmail);
	};
	const handlePassword = (newPassword) => {
		setPassword(newPassword);
	};

	const handleGroupName = (newGroupName) => {
		setGroupName(newGroupName);
	};

	const [value, setValue] = React.useState('create');

	const handleChange = (event) => {
		setValue(event.target.value);
	};

	const handleName = (name) => {
		setName(name);
	};

	const checkEmail = () => {
		setEmailError(false);
		setHelperTextAddress('');
		let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

		if (!re.test(email)) {
			setHelperTextAddress('Tarkista sähköpostiosoite');
			setEmailError(true);
		}
	};

	const checkName = () => {
		setNameError(false);

		if (name === '') {
			setNameError(true);
		}
	};

	const checkPassword = () => {
		setPasswordError(false);
		/*
        Password:
            At least 6
            Numerals
        */
		if (password.length < 8 || !password.match('[0-9]+')) {
			setPasswordError(true);
		}
	};

	const checkGroup = async () => {
		let error = false;
		setGroupNameError(false);
		let groups = await props.firebase
			.userGroups()
			.get()
			.then((querySnapshot) => {
				return querySnapshot.docs.map((item) => {
					return { id: item.id, data: item.data() };
				});
			});
		// new group name have to be unique
		if (value === 'create') {
			for (let i = 0; i < groups.length; i++) {
				if (groups[i].id === groupName) {
					setGroupNameError(true);
					error = true;
				}
			}
			if (groupName === '') {
				setGroupNameError(true);
				error = true;
			}
			// Check that the group exist
		} else if (value === 'join') {
			let groupFound = false;
			for (let i = 0; i < groups.length; i++) {
				if (groups[i].id === groupName) {
					groupFound = true;
				}
			}
			if (!groupFound) {
				setGroupNameError(true);
				error = true;
			}
		}
		return error;
	};

	const addToGroup = (groupName) => {
		props.firebase
			.userGroups()
			.doc(groupName)
			.update({
				userIds: props.firebase.firestore.FieldValue.arrayUnion(
					props.firebase.getCurrentUser().uid
				),
			});
	};

	const createGroup = (groupName) => {
		props.firebase
			.userGroups()
			.doc(groupName)
			.set({
				userIds: [props.firebase.getCurrentUser().uid],
			});
	};

	return (
		<Container component='main' maxWidth='xs'>
			<CssBaseline />
			<div onScroll={true} className={classes.paper}>
				<Typography component='h1' variant='h5'>
					Luo käyttäjä
				</Typography>
				<form className={classes.form} noValidate>
					<TextField
						variant='outlined'
						margin='normal'
						required
						fullWidth
						autoFocus
						name='name'
						label='Nimesi'
						type='Name'
						id='Name'
						onChange={(event) => handleName(event.target.value)}
						error={nameError}
					/>
					<TextField
						variant='outlined'
						margin='normal'
						required
						fullWidth
						id='email'
						label='Sähköposti'
						name='email'
						autoComplete='email'
						onChange={(event) => handleEmail(event.target.value)}
						error={helperTextAddress !== ''}
						helperText={helperTextAddress}
					/>
					<FormControl
						className={classes.inputField}
						variant='outlined'
						required
					>
						<InputLabel htmlFor='outlined-adornment-password'>
							Salasana
						</InputLabel>
						<OutlinedInput
							type={showPassword ? 'text' : 'password'}
							id='outlined-adornment-password'
							fullWidth={true}
							autoComplete='current-password'
							onChange={(event) => handlePassword(event.target.value)}
							value={password}
							error={passwordError}
							endAdornment={
								<InputAdornment position='end'>
									<IconButton
										onClick={() => setShowPassword(!showPassword)}
										aria-label='toggle password visibility'
										edge='end'
									>
										{showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
									</IconButton>
								</InputAdornment>
							}
							labelWidth={75}
						/>
						<FormHelperText id='my-helper-text'>
							{passwordError
								? 'Salasanan täytyy sisältää 8 merkkiä ja ainakin yksi numero'
								: null}
						</FormHelperText>
					</FormControl>
					<FormControl
						component='fieldset'
						className={classes.formControl}
						required
					>
						<FormLabel component='legend'>Liity ryhmään</FormLabel>
						<RadioGroup
							aria-label='gender'
							name='gender1'
							value={value}
							onChange={handleChange}
						>
							<FormControlLabel
								value='create'
								control={<Radio color='primary' />}
								label='Luo uusi ryhmä'
							/>
							{value === 'create' ? (
								<TextField
									variant='outlined'
									margin='normal'
									required
									fullWidth
									name='create'
									label='Syötä ryhmällesi nimi'
									type='create'
									id='create'
									error={GroupNameError}
									helperText={
										GroupNameError && groupName !== ''
											? 'Valitsemasi nimi on jo käytössä'
											: null
									}
									onChange={(event) => handleGroupName(event.target.value)}
								/>
							) : null}
							<FormControlLabel
								value='join'
								control={<Radio color='primary' />}
								label='Liity jo olemassa olevaan ryhmään'
							/>
							{value === 'join' ? (
								<TextField
									variant='outlined'
									margin='normal'
									required
									fullWidth
									name='join'
									label='Syötä ryhmän nimi'
									type='join'
									id='join'
									onChange={(event) => handleGroupName(event.target.value)}
									error={GroupNameError}
									helperText={
										GroupNameError ? 'Laittamaasi nimeä ei löytynyt' : null
									}
								/>
							) : null}
						</RadioGroup>
					</FormControl>
					<Button
						fullWidth
						variant='contained'
						color='primary'
						className={classes.submit}
						onClick={async () => {
							await checkGroup().then((groupError) => {
								checkEmail();
								checkPassword();
								checkName();
								if (!emailError && !passwordError && !groupError) {
									props.firebase
										.doCreateUserWithEmailAndPassword(email, password)
										.then(() => {
											value === 'join'
												? addToGroup(groupName)
												: createGroup(groupName);
											props.firebase
												.users()
												.doc(props.firebase.getCurrentUser().uid)
												.set({
													userGroup: groupName,
													name: name,
												});
											setEmail('');
											setPassword('');
											setGroupName('');
											props.history.push('/');
										})
										.catch((error) => {
											console.error('adsdas', error);
											if (error.code === 'auth/email-already-in-use') {
												setHelperTextAddress('Sähköposti on jo käytössä');
											}
										});
								}
							});
						}}
					>
						Rekisteröidy
					</Button>
					<Grid container>
						<Grid item>
							<Link to='/login'>Vanha käyttäjä? Kirjaudu sisään</Link>
						</Grid>
					</Grid>
				</form>
			</div>
		</Container>
	);
}
