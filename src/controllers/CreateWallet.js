import { useEffect, useState } from 'react'
import { Card, CardHeader, Alert, CardContent, CardActions, Button, Grid } from '@mui/material'
import { withNamespaces } from 'react-i18next';
import Password from '../components/Password'
import FileCreator from '../components/FileCreator';
import webWallet from '../libs/web-wallet'
import keyfile from '../libs/keyfile'
import track from '../libs/track'

function CreateWallet(props) {
    const {t, view, handleCreated} = props
    const [step, setStep] = useState(1)
    const [passwordRequired, setPasswordRequired] = useState(false)
    const [fileStr, setFileStr] = useState(false)

    useEffect(() => {
        setStep(1)
    }, [view])

    return (
        <Card>
            <CardHeader title={ t('create.title') }></CardHeader>
            {
                step == 2 && (
                    <CardContent>
                        <Alert severity="error">{t('dump_as_key_file.warning')}</Alert>
                        { fileStr && <FileCreator color="success" href={fileStr} handleClick={dumpDone}></FileCreator> }
                        <Password open={passwordRequired} handleClose={() => setPasswordRequired(false)} 
                                notEmpty={true} 
                                title="dump_as_key_file.password_title"
                                handlePassword={setPassword}></Password>
                    </CardContent>
                )
            }
            <CardActions>
                <Grid container justifyContent="flex-end" direction="row">
                    { step == 1 && <Button variant="contained" color="error" onClick={createWallet}>{t('create.title')}</Button> }
                </Grid>
            </CardActions>
        </Card>
    )

    function setPassword(password) {
        const wallet = webWallet.restoreFromMnemonic(
            webWallet.generateMnemonic(),
            Date.now() + ''
        )

        setFileStr('data:text/plain,' + keyfile.build(keyfile.encode(wallet.getPrivKey(), password)))
        setPasswordRequired(false)
    }
    
    function createWallet() {
        setStep(2)
        setPasswordRequired(true)
        track.trackStep('create', 1, 2)
    }

    function dumpDone() {
        track.trackDone('create')
        setTimeout(() => {
          handleCreated()
        }, 1000)
    }
}

export default withNamespaces()(CreateWallet)