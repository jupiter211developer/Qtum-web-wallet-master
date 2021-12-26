import { withNamespaces } from 'react-i18next';
import { CardContent, CardHeader, Card, Snackbar, Alert, CardActions, Grid, TextField, Button } from '@mui/material';
import { useState } from 'react';
import webWallet from '../libs/web-wallet'
import track from '../libs/track'
import config from '../libs/config'

function RestoreWif(props) {
    const { t, handleRestored } = props
    
    const [wif, setWif] = useState('')
    const [error, setError] = useState(false)

    return (
        <Card>
            <CardHeader title={ t('restore_wif.title') }></CardHeader>
            <CardContent>
                <Grid container>
                    <Grid item xs={2}>{ t('restore_wif.priv_key') }</Grid>
                    <Grid item xs={10}>
                        <TextField value={wif} sx={{width: '100%'}}  onChange={(ev) => {
                            setWif(ev.target.value)
                        }}
                        onKeyPress={(ev) => {
                            if (ev.key == 'Enter') {
                                restore()
                                ev.preventDefault()
                            }
                        }}
                        ></TextField>
                    </Grid>
                </Grid>
            </CardContent>
            <CardActions>
                <Grid container justifyContent="flex-end" direction="row">
                    <Button variant="contained" color="success" onClick={restore}>{t('common.confirm')}</Button>
                </Grid>
            </CardActions>

            <Snackbar open={error} autoHideDuration={6000} onClose={() => setError(false)}>
                <Alert onClose={() => setError(false)} severity="error" sx={{ width: '100%' }}>
                    { config.getNotifyMessage('restore_wif_fail', t) }
                </Alert>
            </Snackbar>
        </Card>
    )

    function restore() {
        try {
            webWallet.restoreFromWif(this.wif)
        } catch (e) {
            setError(true)
            return false
        }
        track.trackDone('restore_from_wif')
        handleRestored()
    }
}

export default withNamespaces()(RestoreWif)