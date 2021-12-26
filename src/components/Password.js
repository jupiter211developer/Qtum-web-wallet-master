import { CardHeader, Dialog, Grid, Card, CardContent, TextField, CardActions, Button, Snackbar, Alert } from '@mui/material';
import { useState } from 'react';
import { withNamespaces } from 'react-i18next';
import config from '../libs/config'

function Password(props) {
    const {t, open, handleClose, validate, notEmpty, title, handlePassword} = props

    const [password, setPassword] = useState('')
    const [error, setError] = useState(false)

    return (
        <Grid container justifyContent="center" alignItems="center">
            <Dialog open={open} onClose={handleClose}>
                <Card sx={{ width: '500px' }}>
                    <CardHeader title={t(headline())}>
                    </CardHeader>
                    <CardContent>
                        <Grid container>
                            <TextField variant="filled" type="password" label={t('password.password')} sx={{width: '100%'}} 
                                value={password}
                                onChange={(ev) => setPassword(ev.target.value)}
                                onKeyPress={(ev) => {
                                    if (ev.key == 'Enter') {
                                        confirmPassword()
                                        ev.preventDefault()
                                    }
                                }}
                                />
                        </Grid>
                    </CardContent>
                    <CardActions>
                        <Grid container justifyContent="flex-end" direction="row">
                            <Button variant="outlined" onClick={confirmPassword}>{t('common.confirm')}</Button>
                        </Grid>
                    </CardActions>
                </Card>
            </Dialog>
            <Snackbar open={error} autoHideDuration={6000} onClose={() => setError(false)}>
                <Alert onClose={() => setError(false)} severity="error" sx={{ width: '100%' }}>
                    { config.getNotifyMessage('password is_required', t) }
                </Alert>
            </Snackbar>
        </Grid>
    )

    function confirmPassword() {
        let password1 = password

        if (notEmpty && password === '') {
            setError(true)
            return false
        }

        handlePassword(password1)
        setPassword('')
        return true
    }

    function headline() {
        return title || 'password.enter'
    }
}

export default withNamespaces()(Password)