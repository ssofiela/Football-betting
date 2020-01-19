import React from 'react';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { Link } from 'react-router-dom'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import RadioGroup from '@material-ui/core/RadioGroup';


const useStyles = makeStyles(theme => ({
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
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
    }
}));




export default function Register(props) {
    const classes = useStyles();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [groupName, setGroupName] = React.useState('');
    const [emailError, setEmailError] = React.useState(false);
    const [passwordError, setPasswordError] = React.useState(false);
    const [GroupNameError, setGroupNameError] = React.useState(false);


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

    const handleChange = event => {
        setValue(event.target.value);
    };

    const checkEmail = () => {
        setEmailError(false);
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if ( !re.test(email) ) {
            setEmailError(true)
        }
    };

    const checkPassword = () => {
        setPasswordError(false);
        /*
        Password:
            At least 6
            Numerals
        */
        if (
            password.length < 8 || !password.match("[0-9]+")
        ) {
            setPasswordError(true)
        }
    };
    const checkGroup = async () => {
        let error = false;
        setGroupNameError(false);
            let groups = await props.firebase
                .userGroups()
                .get()
                .then(querySnapshot => {
                    return querySnapshot.docs.map(item => {return {id:item.id, data: item.data()}});
                });
        if(value === "create") {
           for(let i = 0; i < groups.length; i ++) {
               if (groups[i].id === groupName){
                   setGroupNameError(true);
                   error = true
               }
           }
            if (error === false) {
                props.firebase.userGroups().doc(groupName).set({
                    userIds: [props.firebase.getCurrentUser().uid]
                })
            }
        } else if(value === "join") {
            let groupFound = false;
            for(let i = 0; i < groups.length; i ++) {
                if (groups[i].id === groupName){
                    groupFound = true;
                    props.firebase.userGroups().doc(groupName).set({
                        userIds: groups[i].data.userIds.push(props.firebase.getCurrentUser().uid)
                    })
                }
            }
            if(groupFound === false) {
                setGroupNameError(true);
                error = true
            }
        }
        return error
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
                        id='email'
                        label='sähköposti'
                        name='email'
                        autoComplete='email'
                        autoFocus
                        onChange={(event) => handleEmail(event.target.value)}
                        error={emailError}
                    />
                    <TextField
                        variant='outlined'
                        margin='normal'
                        required
                        fullWidth
                        name='password'
                        label='Salasana'
                        type='password'
                        id='password'
                        autoComplete='current-password'
                        onChange={(event) => handlePassword(event.target.value)}
                        error={passwordError}
                        helperText={passwordError ? "Salasanan täytyy sisältää 8 merkkiä ja ainakin yksi numero" : null}
                    />
                    {/* id='password'
                        label='Salasana'
                        required={true}
                        name='password'
                        autoComplete='current-password'
                        onChange={(event) => handlePassword(event.target.value)}
                        error={passwordError}
                    */}
                    <FormControl component='fieldset' className={classes.formControl}>
                        <FormLabel component='legend'>Liity ryhmään</FormLabel>
                        <RadioGroup aria-label='gender' name='gender1' value={value} onChange={handleChange}>
                            <FormControlLabel
                                value='create'
                                control={<Radio color='primary' />}
                                label='Luo uusi ryhmä'
                            />
                            {value === 'create' ?
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
                                    helperText={GroupNameError ? 'Valitsemasi nimi on jo käytössä' : null}
                                    onChange={(event) => handleGroupName(event.target.value)}
                                    />
                                    : null
                                }
                            <FormControlLabel
                                value='join'
                                control={<Radio color='primary' />}
                                label='Liity jo olemassa olevaan ryhmään'
                            />
                            {value === 'join' ?
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
                                    helperText={GroupNameError ? 'Laittamaasi nimeä ei löytynyt' : null}
                                />
                                : null
                            }
                        </RadioGroup>
                    </FormControl>
                    <Button
                        fullWidth
                        variant='contained'
                        color='primary'
                        className={classes.submit}
                        onClick={ async () => {
                            await checkGroup().then(groupError => {
                                checkEmail();
                                checkPassword();
                                if (!emailError && !passwordError && !groupError){
                                    props.firebase
                                        .doCreateUserWithEmailAndPassword(email, password)
                                        .then(() => {
                                            setEmail("");
                                            setPassword("");
                                            setGroupName("");
                                            props.history.push("/")
                                        })
                                }
                            });

                        }}
                    >
                        Rekisteröidy
                    </Button>
                    <Grid container>
                        <Grid item>
                            <Link to='/login'>
                                Vanha käyttäjä? Kirjaudu sisään
                            </Link>
                        </Grid>
                    </Grid>
                </form>
            </div>
        </Container>
    );
}

