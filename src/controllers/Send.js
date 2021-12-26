import { withNamespaces } from 'react-i18next';
import { CardContent, CardHeader, Card, Snackbar, Alert, Select, MenuItem, Button, TextField, Dialog, CardActions, Grid, CircularProgress } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { useEffect, useRef, useState } from 'react';
import webWallet from '../libs/web-wallet'
import qrc20 from '../libs/qrc20'
import server from '../libs/server'
import track from '../libs/track'
import config from '../libs/config'

function usePrevious(value) {
    const ref = useRef()

    useEffect(() => {
        ref.current = value
    })

    return ref.current
}

function Send(props) {
    const { t, handleSend } = props
    
    const [address, setAddress] = useState('')
    const [amount, setAmount] = useState('')
    const [symbol, setSymbol] = useState('QTUM')
    const [tokens, setTokens] = useState([])
    const [addTokenStep, setAddTokenStep] = useState(1)
    const [addTokenDialog, setAddTokenDialog] = useState(false)
    const [addTokenLoading, setAddTokenLoading] = useState(false)
    const [addTokenName, setAddTokenName] = useState('')
    const [addTokenSymbol, setAddTokenSymbol] = useState('')
    const [addTokenAddress, setAddTokenAddress] = useState('')
    const [addTokenDecimals, setAddTokenDecimals] = useState(8)
    const [gasPrice, setGasPrice] = useState('40')
    const [gasLimit, setGasLimit] = useState('250000')
    const [fee, setFee] = useState('0.01')
    const [confirmAddressDialog, setConfirmAddressDialog] = useState(false)
    const [repeatAddress, setRepeatAddress] = useState('')
    const [confirmSendDialog, setConfirmSendDialog] = useState(false)
    const [rawTx, setRawTx] = useState('loading...')
    const [canSend, setCanSend] = useState(false)
    const [sending, setSending] = useState(false)

    const [error, setError] = useState(false)
    const [errorType, setErrorType] = useState('error')
    const [errorMsg, setErrorMsg] = useState('address_is_not_same_as_the_old_one')

    const prevSymbol = usePrevious(symbol)

    useEffect(() => {
        initTokens()
    }, [])

    useEffect(() => {
        console.log(symbol)
        if (prevSymbol === 'more') {
            return
        }

        if (symbol === 'more') {
            // setSymbol(from)
            setAddTokenDialog(true)
        }
    }, [symbol])

    // symbol(to, from) {
    //   if (from === 'more') return true
    //   if (to === 'more') {
    //     this.$nextTick(() => {
    //       this.symbol = from
    //       this.addTokenDialog = true
    //     })
    //   }
    // }

    return (
        <Card>
            <CardHeader title={ t('send.send_tokens') }></CardHeader>
            <CardContent>
                <Grid container>
                    <TextField variant="filled" label="Address" value={address} sx={{width: '100%'}}  onChange={(ev) => {
                        setAddress(ev.target.value)
                    }} required></TextField>
                </Grid>
                <Grid container sx={{marginTop: '10px'}}>
                    <Grid item xs={9}>
                        <TextField variant="filled" label="Amount" value={amount} sx={{width: '100%'}}  onChange={(ev) => {
                            setAmount(ev.target.value)
                            }} required></TextField>
                    </Grid>
                    <Grid item xs={3}>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value)}
                            sx={{width: '100%'}}
                        >
                            {
                                tokens.map((token, i) => 
                                    <MenuItem key={i} value={token.value}> { token.text } { token.name ? '(' + token.name + ')' : '' } <br/> { token.address } </MenuItem>
                                )
                            }
                        </Select>
                    </Grid>
                </Grid>
                {
                    symbol !== 'QTUM' && 
                        <Grid container sx={{marginTop: '10px'}}>
                            <TextField variant="filled" label="Gas Price (1e-8 QTUM/gas)" value={gasPrice} sx={{width: '100%'}}  onChange={(ev) => {
                                setGasPrice(ev.target.value)
                            }}></TextField>
                        </Grid>
                }
                {
                    symbol !== 'QTUM' && 
                        <Grid container sx={{marginTop: '10px'}}>
                            <TextField variant="filled" label="Gas Limit" value={gasLimit} sx={{width: '100%'}}  onChange={(ev) => {
                                setGasLimit(ev.target.value)
                            }}></TextField>
                        </Grid>
                }
                <Grid container sx={{marginTop: '10px'}}>
                    <TextField variant="filled" label="Fee" value={fee} sx={{width: '100%'}}  onChange={(ev) => {
                        setFee(ev.target.value)
                    }} required></TextField>
                </Grid>
            </CardContent>
            <CardActions>
                <Grid container justifyContent="flex-end" direction="row">
                    <Button variant="contained" color="success" onClick={() => !notValid() && send()} 
                        // disabled={notValid()}
                        >{t('common.confirm')}</Button>
                </Grid>
            </CardActions>

            <Dialog open={confirmAddressDialog} onClose={() => setConfirmAddressDialog(false)}>
                <Card>
                    <CardHeader title={ t('send.enter_address') }></CardHeader>
                    <CardContent>
                        <TextField variant="filled" type="text" label="Address"
                            value={repeatAddress}
                            onChange={(ev) => setRepeatAddress(ev.target.value)}
                            sx={{width: '100%'}} 
                            >
                        </TextField>
                    </CardContent>
                    <CardActions>
                        <Grid container justifyContent="flex-end" direction="row">
                            <Button variant="contained" className="blue--text" color="success" onClick={confirmAddress}>{t('common.confirm')}</Button>
                            <Button variant="contained" className="red--text" color="error" onClick={() => setConfirmAddressDialog(false)}>{t('common.cancel')}</Button>
                        </Grid>
                    </CardActions>
                </Card>
            </Dialog>

            <Dialog open={confirmSendDialog} onClose={() => setConfirmSendDialog(false)}>
                <Card>
                    <CardHeader title={ t('send.going_to_send') + ' ' + amount + ' ' + symbol + t('send.to_address') + ' ' + address + ' '+ t('common.question_mark') }></CardHeader>
                    <CardContent>
                        <TextField variant="filled" type="text" label="Raw Tx"
                            value={rawTx}
                            onChange={(ev) => setRawTx(ev.target.value)}
                            sx={{width: '100%'}} 
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

            <Dialog open={addTokenDialog} onClose={() => setAddTokenDialog(false)}>
                <Card>
                    <CardHeader title="Token"></CardHeader>
                    <CardContent>
                        <TextField variant="filled" type="text" label={ t('send.token_address') }
                            value={addTokenAddress}
                            onChange={(ev) => setAddTokenAddress(ev.target.value)}
                            sx={{width: '100%'}} 
                            disabled={addTokenStep === 2}
                            >
                        </TextField>
                        {
                            addTokenStep === 2 && 
                                <TextField variant="filled" type="text" label="Name"
                                    value={addTokenName}
                                    onChange={(ev) => setAddTokenName(ev.target.value)}
                                    sx={{width: '100%'}} 
                                    disabled
                                    >
                                </TextField>
                        }
                        {
                            addTokenStep === 2 && 
                                <TextField variant="filled" type="text" label="Symbol"
                                    value={addTokenSymbol}
                                    onChange={(ev) => setAddTokenSymbol(ev.target.value)}
                                    sx={{width: '100%'}} 
                                    disabled
                                    >
                                </TextField>
                        }
                    </CardContent>
                    <CardActions>
                        <Grid container justifyContent="flex-end" direction="row">
                            {
                                addTokenStep === 1 &&
                                    <LoadingButton variant="contained" className="blue--text" color="info" loading={addTokenLoading} onClick={searchAddToken}>
                                        { t('common.search') }
                                    </LoadingButton>
                            }
                            {
                                addTokenStep === 2 && 
                                    <Button variant="contained" className="blue--text" color="success" onClick={confirmAddToken}>{t('common.confirm')}</Button>
                            }
                            <Button variant="contained" className="red--text" color="error" onClick={() => setAddTokenDialog(false)}>{t('common.cancel')}</Button>
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
        //@todo valid the address
        const amountCheck = /^\d+\.?\d*$/.test(amount) && amount > 0
        const feeCheck = /^\d+\.?\d*$/.test(fee) && fee > 0.0001
        return !(amountCheck && feeCheck)
    }

    function send() {
        setConfirmAddressDialog(true)
        setCanSend(false)
    }

    async function confirmAddress() {
        if (address !== repeatAddress) {
            setError(true)
            setErrorMsg('address_is_not_same_as_the_old_one')
            return false
        }
        
        setConfirmAddressDialog(false)
        setConfirmSendDialog(true)

        const wallet = webWallet.getWallet()
        try {
            if (symbol == 'QTUM') {
                let newRawTx = ''
                if (wallet.extend.ledger) {
                    newRawTx = 'Please confirm tx on your ledger...'
                }
                newRawTx = await wallet.generateTx(
                    address.trim(),
                    amount.trim(),
                    fee.trim()
                )

                setRawTx(newRawTx)
            } else if (qrc20.checkSymbol(symbol)) {
                let newRawTx = ''

                if (wallet.extend.ledger) {
                    newRawTx = 'Please confirm tx on your ledger...'
                }
                const token = qrc20.getTokenBySymbol(symbol)
                const encodedData = qrc20.encodeSendData(
                    token,
                    address,
                    amount
                )
                newRawTx = await wallet.generateSendToContractTx(
                    token.address,
                    encodedData,
                    gasLimit.trim(),
                    gasPrice.trim(),
                    fee.trim()
                )

                setRawTx(newRawTx)
            }

            setCanSend(true)
            track.trackAction('preview', 'send', symbol)
        } catch (e) {
            alert(e.message || e)
            track.trackException(
                `send: send_generate_tx_error: ${e.stack || e.toString() || e}`
            )
            setConfirmSendDialog(false)
            return false
        }
    }

    async function confirmSend() {
        setSending(true)
        try {
            const res = await webWallet.getWallet().sendRawTx(rawTx)
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
            track.trackAction('done', 'send', symbol)
            handleSend()
        } catch (e) {
            alert(e.message || e)
            track.trackException(
                `send: send_post_raw_tx_error: ${e.response ||
                e.stack ||
                e.toString() ||
                e}`
            )
            setConfirmSendDialog(false)
        }
    }

    async function searchAddToken() {
        setAddTokenLoading(true)
        try {
            const tokenInfo = await qrc20.fetchTokenInfo(addTokenAddress)
            
            setAddTokenName(tokenInfo.name)
            setAddTokenSymbol(tokenInfo.symbol)
            setAddTokenDecimals(tokenInfo.decimals)

            track.trackAction(
                'addToken',
                'send',
                `${addTokenAddress}, ${tokenInfo.name}`
            )
        } catch (e) {
            setAddTokenLoading(false)
            if (
                (e.response && e.response.status === 404) ||
                e.message === 'this contract is not a qrc20 token'
            ) {
                setError(true)
                setErrorType('error')
                setErrorMsg('token_contract_address_is_not_exists')
            } else {
                alert(e.message || e)
                setAddTokenDialog(false)
            }
            return false
        }
        setAddTokenLoading(false)
        setAddTokenStep(2)
    }

    function confirmAddToken() {
        qrc20.addCustomToken(
            addTokenAddress,
            addTokenName,
            addTokenSymbol,
            addTokenDecimals
        )
        initTokens()

        setSymbol(addTokenSymbol)
        setAddTokenStep(1)
        setAddTokenDialog(false)
        setAddTokenAddress('')
    }

    function initTokens() {
        const tokenList = [{ text: 'QTUM', value: 'QTUM' }]
        qrc20.getTokenList().forEach(token => {
            tokenList[tokenList.length] = {
                text: token.symbol,
                value: token.symbol,
                name: token.name,
                address: token.address
            }
        })
        tokenList[tokenList.length] = { text: 'More...', value: 'more' }
        setTokens(tokenList)
    }
}

export default withNamespaces()(Send)