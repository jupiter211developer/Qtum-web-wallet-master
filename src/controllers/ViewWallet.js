import { withNamespaces } from 'react-i18next';
import { CardContent, CardHeader, Card, Snackbar, Alert, Grid, TextField, Button, InputAdornment, IconButton } from '@mui/material';
import { useEffect, useState } from 'react';
import webWallet from '../libs/web-wallet'
import track from '../libs/track'
import config from '../libs/config'
import NFTList from '../components/NFT/NFTList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const infoLabel = [
    { label: 'address', name: 'address', copy: true },
    { label: 'balance', name: 'balance' },
    { label: 'unconfirmed_balance', name: 'unconfirmedBalance' }
]

function ViewWallet(props) {
    const { t, view } = props
    
    const [wallet, setWallet] = useState(webWallet.getWallet())
    const [showPriv, setShowPriv] = useState(false)
    const [error, setError] = useState(false)
    const [errorType, setErrorType] = useState('error')
    const [errorMsg, setErrorMsg] = useState('copy fail')

    useEffect(() => {
        if (view == 1) {
            wallet.setInfo()
        }
    }, [view])

    useEffect(() => {
        wallet.update()
    }, [])

    return (
        <Card>
            <CardHeader title={ t('view.title') }></CardHeader>
            <CardContent>
                {
                    infoLabel.map((item, i) => (
                        <Grid container key={i}>
                            <Grid item xs={3} sx={{ margin: 'auto 0' }}>
                                { t('common.info.' + item.label) }
                            </Grid>
                            <Grid item xs={7}>
                                <TextField sx={{width: '100%'}} value={wallet.info[item.name]}
                                    disabled></TextField>
                            </Grid>
                            <Grid item xs={2} sx={{ margin: 'auto 0' }}>
                                {
                                    item.copy &&
                                        <Button variant="contained" color="info" size="small" onClick={() => copyToClipboard(wallet.info[item.name])}>
                                            { t('common.copy') }
                                        </Button>
                                }
                            </Grid>
                        </Grid>
                    ))
                }
                {
                    privKey() !== null && (
                        <Grid container>
                            <Grid container>
                                <Grid item xs={3} sx={{ margin: 'auto 0' }}>
                                    { t('common.info.priv_key') }
                                </Grid>
                                <Grid item xs={7}>
                                    <TextField sx={{width: '100%'}} value={privKey()}
                                        disabled
                                        type={showPriv ? 'text' : 'password'}
                                        InputProps={{
                                            endAdornment: 
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={() => { setShowPriv(!showPriv) }}
                                                        onMouseDown={(e) => { e.preventDefault() }}
                                                        edge="end"
                                                    >
                                                        {showPriv ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                    </IconButton>
                                                </InputAdornment>
                                          }}
                                        ></TextField>
                                </Grid>
                                <Grid item xs={2} sx={{ margin: 'auto 0' }}>
                                    {
                                        showPriv &&
                                            <Button variant="contained" color="info" size="small" onClick={() => copyToClipboard(privKey())}>
                                                { t('common.copy') }
                                            </Button>
                                    }
                                </Grid>
                            </Grid>
                        </Grid>
                    )
                }
                {
                    wallet.info.qrc20.length > 0 && 
                        <Grid container>
                            <Grid item xs={3} sx={{ margin: 'auto 0' }}>
                                QRC20
                            </Grid>
                            <Grid item xs={7}>
                                {
                                    wallet.info.qrc20.map((token, i) => {
                                        <Card key={i}>
                                            <CardContent>
                                                <Grid container>
                                                    <Grid item xs={5}>{ token.name }</Grid>
                                                    <Grid item xs={7}>{ token.balance } { token.symbol }</Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    })
                                }
                            </Grid>
                        </Grid>
                }
                <NFTList></NFTList>
            </CardContent>

            <Snackbar open={error} autoHideDuration={6000} onClose={() => setError(false)}>
                <Alert onClose={() => setError(false)} severity={errorType} sx={{ width: '100%' }}>
                    { config.getNotifyMessage(errorMsg, t) }
                </Alert>
            </Snackbar>
        </Card>
    )

    function privKey() {
        return wallet.getPrivKey()
    }

    function onCopySucc() {
        track.trackAction('copy', 'view', 'privkey')
        setError(true)
        setErrorType('success')
        setErrorMsg('copy success')
    }

    function onCopyError() {
        setError(true)
        setErrorType('error')
        setErrorMsg('copy fail')
    }

    function copyToClipboard(str) {
        try {
            navigator.clipboard.writeText(str)
            onCopySucc()
        } catch (e) {
            onCopyError()
        }
    }
}

export default withNamespaces()(ViewWallet)