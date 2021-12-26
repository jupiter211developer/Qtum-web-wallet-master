import { useState } from 'react'
import { Card, CardHeader, CardContent, Alert } from '@mui/material'
import { withNamespaces } from 'react-i18next';
import webWallet from '../libs/web-wallet'
import FileCreator from '../components/FileCreator';
import keyfile from '../libs/keyfile'
import Password from '../components/Password';

function DumpKeyFile(props) {
    const { t } = props
    
    const [passwordRequired, setPasswordRequired] = useState(true)
    const [wallet, setWallet] = useState(webWallet.getWallet())
    const [fileStr, setFileStr] = useState(false)

    return (
        <Card>
            <CardHeader title={ t('dump_as_key_file.title') }></CardHeader>
            <CardContent>
                <Alert severity="error">{t('dump_as_key_file.warning')}</Alert>
                { fileStr && <FileCreator color="success" href={fileStr} handleClick={() => {}}></FileCreator> }
                <Password open={passwordRequired} handlePassword={inputed} handleClose={() => setPasswordRequired(false)}></Password>
            </CardContent>
        </Card>
    )

    function inputed(password) {
        setPasswordRequired(false)
        setFileStr('data:text/plain,' + keyfile.build(keyfile.encode(wallet.getPrivKey(), password)))
    }
}

export default withNamespaces()(DumpKeyFile)