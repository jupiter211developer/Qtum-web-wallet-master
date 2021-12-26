import { withNamespaces } from 'react-i18next';
import { CardContent, CardHeader, Card, Snackbar, Alert } from '@mui/material';
import { useState } from 'react';
import Password from '../components/Password'
import webWallet from '../libs/web-wallet'
import config from '../libs/config'
import track from '../libs/track'
import keyfile from '../libs/keyfile'
import FileReader from '../components/FileReader';

function RestoreKeyFile(props) {
    const { t, handleRestored } = props
    
    const [passwordRequired, setPasswordRequired] = useState(false)
    const [content, setContent] = useState('')
    const [error, setError] = useState(false)
    const [errorText, setErrorText] = useState('the_key_file_is_not_a_valid_format')

    return (
        <Card>
            <CardHeader title={ t('restore_key_file.title') }></CardHeader>
            <CardContent>
                <FileReader color="success" handleUpload={parseKeyFile}></FileReader>
                <Password open={passwordRequired} handlePassword={inputed} handleClose={() => setPasswordRequired(false)}></Password>
            </CardContent>

            <Snackbar open={error} autoHideDuration={6000} onClose={() => setError(false)}>
                <Alert onClose={() => setError(false)} severity="error" sx={{ width: '100%' }}>
                    { config.getNotifyMessage(errorText, t) }
                </Alert>
            </Snackbar>
        </Card>
    )

    function parseKeyFile(upload) {
        let content = keyfile.parse(upload.content)
        track.trackStep('restore_from_key_file', 1, 2)
        if (content) {
            setPasswordRequired(true)
            setContent(content)
        } else {
            track.trackException('restore_from_key_file: key file error')
            setError(true)
            setErrorText('the_key_file_is_not_a_valid_format')
        }
    }

    function inputed(password) {
        setPasswordRequired(false)
        try {
            webWallet.restoreFromWif(keyfile.decode(content, password))
        } catch (e) {
            setError(true)
            setErrorText('restore_key_file_fail')
            return false
        }
        track.trackDone('restore_from_key_file')
        handleRestored()
    }
}

export default withNamespaces()(RestoreKeyFile)