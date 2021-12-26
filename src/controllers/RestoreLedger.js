import { withNamespaces } from 'react-i18next';
import { CardContent, CardHeader, CardActions, Card, Snackbar, Alert, Grid, Button } from '@mui/material';
import { useState } from 'react';
import webWallet from '../libs/web-wallet'
import config from '../libs/config'
import track from '../libs/track'
import DerivePath from '../components/DerivePath';

function RestoreLedger(props) {
    const { t, handleRestored } = props
    
    const [step, setStep] = useState(2)
    const [ledger, setLedger] = useState(null)
    const [error, setError] = useState(false)

    return (
        <Card>
            <CardHeader title={ t('restore_ledger.title') }></CardHeader>
            <CardContent>
                {
                    step === 1 && (
                        <>
                            <Alert severity="info">{t('restore_ledger.usage')}</Alert>
                            <a href="https://www.ledgerwallet.com/apps/manager" target="_blank" style={{color: '#339900'}}>
                                { t('restore_ledger.download') }
                            </a>
                        </>
                    )
                }
                {
                    step === 2 && (
                        <DerivePath ledger={ledger} handleSetWallet={setWallet}></DerivePath>
                    )
                }
            </CardContent>
            <CardActions>
                <Grid container justifyContent="flex-end" direction="row">
                    { step === 1 && <Button variant="contained" color="error" onClick={connect}>{t('restore_ledger.connect')}</Button> }
                </Grid>
            </CardActions>

            <Snackbar open={error} autoHideDuration={6000} onClose={() => setError(false)}>
                <Alert onClose={() => setError(false)} severity="error" sx={{ width: '100%' }}>
                    { config.getNotifyMessage('connect_ledger_fail', t) }
                </Alert>
            </Snackbar>
        </Card>
    )

    async function connect() {
        try {
            this.ledger = await webWallet.connectLedger()
        } catch (e) {
            this.$root.error('connect_ledger_fail')
            this.$root.log.error(
                'restore_ledger_connect_error',
                e.stack || e.toString() || e
            )
            track.trackException(
                `restore_from_ledger: connect error: ${e.stack || e.toString()}`,
                true
            )
            return false
        }
        this.step = 2
        track.trackStep('restore_from_ledger', 1, 2)

        try {
            setLedger(await webWallet.connectLedger())
        } catch (e) {
            setError(true)
            track.trackException(
                `restore_from_ledger: connect error: ${e.stack || e.toString()}`,
                true
            )
            return false
        }
        setStep(2)
        track.trackStep('restore_from_ledger', 1, 2)
    }

    function setWallet(wallet) {
        webWallet.setWallet(wallet)
        handleRestored()
    }
}

export default withNamespaces()(RestoreLedger)