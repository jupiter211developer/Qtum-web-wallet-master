import { useEffect, useState } from 'react'
import { Card, CardHeader, CardContent, TextField, Snackbar, Alert, CardActions, Grid, CircularProgress, Button, Dialog, Select, MenuItem, InputLabel } from '@mui/material'
import { withNamespaces } from 'react-i18next';
import webWallet from '../libs/web-wallet'
import config from '../libs/config'
import server from '../libs/server'
import abiModule from 'ethjs-abi'


function SendToContract(props) {
    const { t } = props
    
    const [contractAddress, setContractAddress] = useState('')
    const [abi, setAbi] = useState('')
    const [parsedAbi, setParsedAbi] = useState(null)
    const [method, setMethod] = useState(null)
    const [inputParams, setInputParams] = useState([])
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

    useEffect(() => {
        setInputParams([])
    }, [method])

    useEffect(() => {
        decodeAbi()
    }, [abi])

    return (
        <Card>
            <CardHeader title={ t('send_to_contract.title') }></CardHeader>
            <CardContent>
                <TextField
                    variant="standard"
                    label="Contract Address"
                    sx={{ width: '100%', marginTop: '10px' }}
                    value={contractAddress}
                    onChange={(ev) => {
                        setContractAddress(ev.target.value)
                    }}
                    required>
                </TextField>
                <TextField
                    variant="standard"
                    label="ABI"
                    sx={{ width: '100%', marginTop: '10px' }}
                    value={abi}
                    onChange={(ev) => {
                        setAbi(ev.target.value)
                    }}
                    required
                    multiline
                    maxRows={6}
                    minRows={4}>
                </TextField>
                {
                    parsedAbi && 
                    <>
                        <InputLabel id="demo-simple-select-label">Method</InputLabel>
                        <Select
                            label="Method"
                            labelId="demo-simple-select-label"
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            sx={{width: '100%', marginTop: '20px'}}
                        >
                            {
                                parsedAbi.map((item, i) => 
                                    <MenuItem key={i} value={item}> { item } </MenuItem>
                                )
                            }
                        </Select>
                    </>
                }
                {
                    params() && params().map((param, index) =>
                        <TextField
                            key={index}
                            variant="standard"
                            label={param.name}
                            sx={{ width: '100%', marginTop: '10px' }}
                            value={inputParams[index]}
                            onChange={(ev) => {
                                updateInputParams(index, ev.target.value)
                            }}
                            required>
                        </TextField>
                    )
                }
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
                    <CardHeader title={ t('send_to_contract.confirm') }></CardHeader>
                    <CardContent>
                        <TextField variant="filled" type="text" label="Raw Tx"
                            value={rawTx}
                            // onChange={(ev) => setRawTx(ev.target.value)}
                            sx={{width: '100%'}} 
                            // disabled
                            maxRows={6}
                            multiline
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
        //@todo valid the address
        const gasPriceCheck = /^\d+\.?\d*$/.test(gasPrice) && gasPrice > 0
        const gasLimitCheck = /^\d+\.?\d*$/.test(gasLimit) && gasLimit > 0
        const feeCheck = /^\d+\.?\d*$/.test(fee) && fee > 0.0001
        return !(
            gasPriceCheck &&
            gasLimitCheck &&
            feeCheck &&
            method !== null
        )
    }

    function params() {
        if (method === null) {
            return null
        }
        const inputs = parsedAbi[method].info.inputs
        if (inputs.length > 0) {
            return inputs
        }
        return null
    }

    function decodeAbi() {
        try {
            const abiJson = JSON.parse(abi)
            const newParsedAbi = []
            for (let i = 0; i < abiJson.length; i++) {
                // 过滤 constructor & event
                if (abiJson[i].type === 'constructor' || abiJson[i].type === 'event')
                    continue
                newParsedAbi.push({
                    text: abiJson[i]['name'],
                    value: i,
                    info: abiJson[i]
                })
            }
            setParsedAbi(newParsedAbi)
        } catch (e) {
            return true
        }
    }

    async function send() {
        try {
            const encodedData = abiModule
                .encodeMethod(parsedAbi[method].info, inputParams)
                .substr(2)
            setConfirmSendDialog(true)
            try {
                setRawTx(await webWallet
                    .getWallet()
                    .generateSendToContractTx(
                        contractAddress,
                        encodedData,
                        gasLimit,
                        gasPrice,
                        fee
                    ))
            } catch (e) {
                alert(e.message || e)
                setConfirmSendDialog(false)
                return false
            }

            setCanSend(true)
        } catch (e) {
            setError(true)
            setErrorType('error')
            setErrorMsg('Params error')

            this.confirmSendDialog = false
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
            // this.$emit('send')
        } catch (e) {
            alert(e.message || e)
            setConfirmSendDialog(false)
        }
    }

    function updateInputParams(index, value) {
        const newInputParams = [...inputParams]
        newInputParams[index] = value
        setInputParams(newInputParams)
    }
}

export default withNamespaces()(SendToContract)