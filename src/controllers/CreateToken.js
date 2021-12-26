import { useState } from 'react'
import { Card, CardHeader, CardContent, TextField, Snackbar, Alert, CardActions, Grid, CircularProgress, Button, Dialog } from '@mui/material'
import { withNamespaces } from 'react-i18next';
import webWallet from '../libs/web-wallet'
import config from '../libs/config'
import server from '../libs/server'


function CreateToken(props) {
    const { t } = props
    
    const [name, setName] = useState('')
    const [symbol, setSymbol] = useState('')
    const [decimal, setDecimal] = useState('8')
    const [totalSupply, setTotalSupply] = useState('')
    const [gasPrice, setGasPrice] = useState('40')
    const [gasLimit, setGasLimit] = useState('2500000')
    const [fee, setFee] = useState('0.01')
    const [confirmSendDialog, setConfirmSendDialog] = useState(false)
    const [rawTx, setRawTx] = useState('loading...')
    const [canSend, setCanSend] = useState(false)
    const [sending, setSending] = useState(false)

    const [error, setError] = useState(false)
    const [errorType, setErrorType] = useState('error')
    const [errorMsg, setErrorMsg] = useState('')

    return (
        <Card>
            <CardHeader title={ t('create_token.title') }></CardHeader>
            <CardContent>
                <TextField
                    variant="standard"
                    label={t('create_token.name')}
                    sx={{ width: '100%', marginTop: '10px' }}
                    value={name}
                    onChange={(ev) => {
                        setName(ev.target.value)
                    }}
                    required>
                </TextField>
                <TextField
                    variant="standard"
                    label={t('create_token.symbol')}
                    sx={{ width: '100%', marginTop: '10px' }}
                    value={symbol}
                    onChange={(ev) => {
                        setSymbol(ev.target.value)
                    }}
                    required>
                </TextField>
                <TextField
                    variant="standard"
                    label={t('create_token.decimal')}
                    sx={{ width: '100%', marginTop: '10px' }}
                    value={decimal}
                    onChange={(ev) => {
                        setDecimal(ev.target.value)
                    }}
                    required>
                </TextField>
                <TextField
                    variant="standard"
                    label={t('create_token.total_supply')}
                    sx={{ width: '100%', marginTop: '10px' }}
                    value={totalSupply}
                    onChange={(ev) => {
                        setTotalSupply(ev.target.value)
                    }}
                    required>
                </TextField>
                <TextField
                    variant="standard"
                    label="Gas Price (1e-8 QTUM/gas)"
                    sx={{ width: '100%', marginTop: '10px' }}
                    value={gasPrice}
                    onChange={(ev) => {
                        setGasPrice(ev.target.value)
                    }}
                    required>
                </TextField>
                <TextField
                    variant="standard"
                    label="Gas Limit"
                    sx={{ width: '100%', marginTop: '10px' }}
                    value={gasLimit}
                    onChange={(ev) => {
                        setGasLimit(ev.target.value)
                    }}
                    required>
                </TextField>
                <TextField
                    variant="standard"
                    label="Fee"
                    sx={{ width: '100%', marginTop: '10px' }}
                    value={fee}
                    onChange={(ev) => {
                        setFee(ev.target.value)
                    }}
                    required>
                </TextField>
            </CardContent>
            <CardActions>
                <Grid container justifyContent="flex-end" direction="row">
                    <Button variant="contained" color="success" onClick={() => !notValid() && send() }>{t('common.confirm')}</Button>
                </Grid>
            </CardActions>

            <Dialog open={confirmSendDialog} onClose={() => setConfirmSendDialog(false)}>
                <Card>
                    <CardHeader title={ t('create_token.confirm') }></CardHeader>
                    <CardContent>
                        <TextField variant="filled" type="text" label="Raw Tx"
                            value={rawTx}
                            // onChange={(ev) => setRawTx(ev.target.value)}
                            sx={{width: '100%'}}
                            // disabled
                            multiline
                            maxRows={6}
                            >
                        </TextField>
                    </CardContent>
                    <CardActions>
                        <Grid container justifyContent="flex-end" direction="row">
                            {
                                canSend && !sending && 
                                    <Button variant="contained" className="blue--text" color="success" onClick={confirmSend}>{t('common.confirm')}</Button>
                            }
                            {
                                !sending && 
                                    <Button variant="contained" className="red--text" color="error" onClick={() => setConfirmSendDialog(false)}>{t('common.cancel')}</Button>
                            }
                            { sending && <CircularProgress size={50} color="primary"></CircularProgress> }
                        </Grid>
                    </CardActions>
                </Card>
            </Dialog>
            
            <Snackbar open={error} autoHideDuration={6000} onClose={() => setError(false)}>
                <Alert onClose={() => setError(false)} severity={errorType} sx={{ width: '100%' }}>
                    { config.getNotifyMessage(errorMsg, t) }
                </Alert>
            </Snackbar>
        </Card>
    )
    
    function notValid() {
        const decimalCheck = /^(0|[1-9][0-9]*)$/.test(decimal) && decimal < 256
        const totalSupplyCheck = !isNaN(totalSupply)
        const gasPriceCheck = /^\d+\.?\d*$/.test(gasPrice) && gasPrice > 0
        const gasLimitCheck = /^\d+\.?\d*$/.test(gasLimit) && gasLimit > 0
        const feeCheck = /^\d+\.?\d*$/.test(fee) && fee > 0.0001
        return !(
            decimalCheck &&
            totalSupplyCheck &&
            gasPriceCheck &&
            gasLimitCheck &&
            feeCheck
        )
    }

    async function send() {
        setConfirmSendDialog(true)
        const wallet = webWallet.getWallet()
        try {
            setRawTx(await wallet.generateCreateTokenTx(
                name,
                symbol,
                decimal,
                totalSupply,
                gasLimit,
                gasPrice,
                fee
            ))

            setCanSend(true)
        } catch (e) {
            alert(e.message || e)
            setConfirmSendDialog(false)
            return false
        }
    }

    async function confirmSend() {
        const wallet = webWallet.getWallet()
        setSending(true)
        try {
            const res = await wallet.sendRawTx(rawTx)
            setConfirmSendDialog(false)
            setSending(false)
            if (res.txId) {
                const txViewUrl = server.currentNode().getTxExplorerUrl(res.txId)

                setError(true)
                setErrorType('success')
                setErrorMsg(`Successful send. You can view at <a href="${txViewUrl}" target="_blank">${txViewUrl}</a>`)
            } else {
                setError(true)
                setErrorType('error')
                setErrorMsg(`Send Failed : ${res.message}`)
            }

            // this.$emit('send')
        } catch (e) {
            alert(e.message || e)
            setConfirmSendDialog(false)
        }
    }
}

export default withNamespaces()(CreateToken)