import { useEffect, useState } from 'react'
import { Card, CardHeader, Alert, CardContent, CardActions, Button, Grid, Snackbar } from '@mui/material'
import { withNamespaces } from 'react-i18next';
import webWallet from '../libs/web-wallet'
import DelegationHeadAction from '../components/Delegation/HeadAction';
import DelegationInfo from '../components/Delegation/Info';
import config from '../libs/config'

function Delegation(props) {
    const {t, view} = props
    
    const [wallet, setWallet] = useState(webWallet.getWallet())
    const [snackbarShow, setSnackbarShow] = useState(false)

    const [error, setError] = useState(false)
    const [errorType, setErrorType] = useState('error')
    const [errorMsg, setErrorMsg] = useState('')

    useEffect(() => {
        if (view) {
            const newWallet = webWallet.getWallet()
            newWallet.setInfo()
            setWallet(newWallet)
        }
    }, [view])

    return (
        <Card>
            <CardHeader title={ t('delegation.title') }></CardHeader>
            <CardContent>
                <DelegationHeadAction wallet={wallet} handleNotify={notify} />
                {
                    wallet && wallet.info.delegateStatus !== 'none' && wallet.info.delegateStatus !== 'delDelegation'
                        && <DelegationInfo wallet={wallet} handleNotify={notify}></DelegationInfo>
                }
            </CardContent>

            <Snackbar open={error} autoHideDuration={6000} onClose={() => setError(false)}>
                <Alert onClose={() => setError(false)} severity={errorType} sx={{ width: '100%' }}>
                    { config.getNotifyMessage(errorMsg, t) }
                </Alert>
            </Snackbar>
        </Card>
    )

    function notify(message, type) {
        setError(true)
        setErrorType(type)
        setErrorMsg(message)
    }
}

export default withNamespaces()(Delegation)