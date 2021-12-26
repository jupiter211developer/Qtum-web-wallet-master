import { withNamespaces } from 'react-i18next';
import { CardContent, CardHeader, Card, Snackbar, Alert } from '@mui/material';
import { useState } from 'react';
import Mnemonic from '../components/Mnemonic';
import Password from '../components/Password'
import webWallet from '../libs/web-wallet'
import config from '../libs/config'
import track from '../libs/track'

function RestoreWallet(props) {
    const { t, handleRestored } = props
    
    const [passwordRequired, setPasswordRequired] = useState(false)
    const [inputMnemonic, setInputMnemonic] = useState([])
    const [error, setError] = useState(false)

    return (
        <Card>
            <CardHeader title={ t('restore.title') }></CardHeader>
            <CardContent>
                <Mnemonic handleMnemonic={restore}/>
            </CardContent>
            <Password open={passwordRequired} handlePassword={setPassword} handleClose={() => setPasswordRequired(false)}></Password>

            <Snackbar open={error} autoHideDuration={6000} onClose={() => setError(false)}>
                <Alert onClose={() => setError(false)} severity="error" sx={{ width: '100%' }}>
                    { config.getNotifyMessage('mnemonics_can_not_restore', t) }
                </Alert>
            </Snackbar>
        </Card>
    )

    function restore(mnemonic) {
        setInputMnemonic(mnemonic)
        if (!webWallet.validateBip39Mnemonic(inputMnemonic)) {
            if (!confirm(t('restore.mnemonic_warning'))) return false
        }
        setPasswordRequired(mnemonic)
        track.trackStep('restore_from_mnemonic', 1, 2)
    }

    function setPassword(password) {
        setPasswordRequired(false)
        if (!webWallet.restoreFromMnemonic(inputMnemonic, password)) {
            setError(true)
            return false
        }
        track.trackDone('restore_from_mnemonic')
        handleRestored()
    }
}

export default withNamespaces()(RestoreWallet)