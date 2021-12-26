import { Card, CardActions, CardContent, CardHeader, Chip, Button, Snackbar, Alert, Grid } from '@mui/material';
import { useState, useEffect } from 'react';
import { withNamespaces } from 'react-i18next';

import Password from '../components/Password'

import track from '../libs/track'
import config from '../libs/config'
import webWallet from '../libs/web-wallet'
import Mnemonic from '../components/Mnemonic';

function CreateMnemonic(props) {
    const { t, view, handleCreated } = props

    const [step, setStep] = useState(1)
    const [passwordRequired, setPasswordRequired] = useState(false)
    const [inputPassword, setInputPassword] = useState('')
    const [words, setWords] = useState(['xxxx', 'xxxx','xxxx','xxxx','xxxx','xxxx','xxxx','xxxx','xxxx','xxxx','xxxx',])
    const [wallet, setWallet] = useState(false)
    const [error, setError] = useState(false)
    const [errorText, setErrorText] = useState('password_is_not_same_as_the_old_one')

    useEffect(() => {
        setStep(1)
    }, [view])

    return (
        <Card>
            <CardHeader title={ t('create_mnemonic.title') }></CardHeader>
            {
                [3, 5].includes(step) &&
                    (
                        <CardContent>
                            { step == 3 ? (
                                <>
                                    <p>{ t('create_mnemonic.remember') }</p>
                                    <div style={{ marginTop: '20px' }}>
                                        {
                                            words.map((word, i) => (
                                                <Chip label={word} key={i} sx={{ color: 'white', backgroundColor: '#606060', margin: '3px 5px', borderRadius: '2px' }} />
                                            ))
                                        }
                                    </div>
                                </>
                            ) : (
                                step == 5 && (
                                    <Mnemonic handleMnemonic={validateMnemonic}/>
                                )
                            ) }
                        </CardContent>
                    )
            }
            <CardActions>
                <Grid container justifyContent="flex-end" direction="row">
                    { step == 1 && <Button variant="contained" color="error" onClick={createWallet}>{ t('create_mnemonic.title') }</Button> }
                    { step == 3 && <Button variant="contained" color="info" onClick={checkWallet}>{ t('create_mnemonic.remembered') }</Button> }
                </Grid>
            </CardActions>
            <Password open={passwordRequired} handlePassword={setPassword} handleClose={() => setPasswordRequired(false)}></Password>
            
            <Snackbar open={error} autoHideDuration={6000} onClose={() => setError(false)}>
                <Alert onClose={() => setError(false)} severity="error" sx={{ width: '100%' }}>
                    { config.getNotifyMessage(errorText, t) }
                </Alert>
            </Snackbar>
        </Card>
    )

    function setPassword(password) {
        if (step == 2) {
            setPasswordRequired(false)
            setStep(3)
            setInputPassword(password)

            const mnemonic = webWallet.generateMnemonic()
            setWallet(webWallet.restoreFromMnemonic(mnemonic, password))
            setWords(mnemonic.split(' '))
            track.trackStep('create_from_mnemonic', 2, 3)
        } else if (step == 4) {
            if (inputPassword !== password) {
                setError(true)
                setErrorText('password_is_not_same_as_the_old_one')
                return false
            }
            setPasswordRequired(false)
            setStep(5)
            track.trackStep('create_from_mnemonic', 4, 5)
        }
    }

    function createWallet() {
        setStep(2)
        setPasswordRequired(true)
        track.trackStep('create_from_mnemonic', 1, 2)
    }

    function checkWallet() {
        setStep(4)
        setPasswordRequired(true)
        track.trackStep('create_from_mnemonic', 3, 4)
    }

    function validateMnemonic(mnemonic) {
        if (wallet.validateMnemonic(mnemonic, inputPassword)) {
            setError(true)
            setErrorText('mnemonics_are_not_same_as_the_words_should_remember')
            return false
        }
        track.trackDone('create_from_mnemonic')
        handleCreated()
    }
}

export default withNamespaces()(CreateMnemonic)