import { withNamespaces } from 'react-i18next';
import { CardContent, CardHeader, Card, Snackbar, Alert, Step, StepLabel, StepContent, Stepper, Button, TextField, Dialog, CardActions, Grid } from '@mui/material';
import { useState } from 'react';
import webWallet from '../libs/web-wallet'
import wallet from '../libs/wallet'
import config from '../libs/config'
import server from '../libs/server'
import fileSaver from 'file-saver'
import FileReaderComp from '../components/FileReader'

function SafeSend(props) {
    const { t, handleSend } = props
    
    const [mode, setMode] = useState(config.getMode())
    const [step, setStep] = useState(0)
    const [fromAddress, setFromAddress] = useState('')
    const [toAddress, setToAddress] = useState('')
    const [amount, setAmount] = useState('')
    const [fee, setFee] = useState('')
    const [utxo, setUtxo] = useState([])
    const [confirmAddressDialog, setConfirmAddressDialog] = useState(false)
    const [repeatToAddress, setRepeatToAddress] = useState('')
    const [confirmSendDialog, setConfirmSendDialog] = useState(false)
    const [fileParsed, setFileParsed] = useState(false)
    const [rawTx, setRawTx] = useState('loading...')
    
    const [error, setError] = useState(false)
    const [errorType, setErrorType] = useState('error')
    const [errorMsg, setErrorMsg] = useState('from_address_is_not_same_as_the_wallet')

    return (
        <Card>
            <CardHeader title={ t('safe_send.title') }></CardHeader>
            <CardContent>
                <Alert severity="info">{t('safe_send.info')}</Alert>
                <Stepper activeStep={step} orientation="vertical" nonLinear>
                    <Step key={0}>
                        <StepLabel sx={{ color: 'white' }} onClick={() => setStep(0)}>
                            Generate Base Info (At online computer)
                        </StepLabel>
                        <StepContent>
                            {
                                mode === 'offline' ?
                                    <>
                                        <Alert severity="info">{t('safe_send.info1_offline')}</Alert>
                                        <Button variant="contained" color="info" onClick={() => setStep(1)}>
                                            { t('common.next') }
                                        </Button>
                                    </>
                                    :
                                    <>
                                        <Alert severity="info">{t('safe_send.info1_online')}</Alert>
                                        <TextField
                                            variant="standard"
                                            label="From Address"
                                            sx={{ width: '100%' }}
                                            value={fromAddress}
                                            onChange={(ev) => {
                                                setFromAddress(ev.target.value)
                                            }}
                                            required>
                                        </TextField>
                                        <TextField
                                            variant="standard"
                                            label="To Address"
                                            sx={{ width: '100%' }}
                                            value={toAddress}
                                            onChange={(ev) => {
                                                setToAddress(ev.target.value)
                                            }}
                                            required>
                                        </TextField>
                                        <TextField
                                            variant="standard"
                                            label="Amount"
                                            sx={{ width: '100%' }}
                                            value={amount}
                                            onChange={(ev) => {
                                                setAmount(ev.target.value)
                                            }}
                                            required>
                                        </TextField>
                                        <TextField
                                            variant="standard"
                                            label="Fee"
                                            sx={{ width: '100%' }}
                                            value={fee}
                                            onChange={(ev) => {
                                                setFee(ev.target.value)
                                            }}
                                            required>
                                        </TextField>
                                        <Button variant="contained" color="success"
                                            sx={{ marginTop: '10px', marginLeft: '20px' }}
                                            // disabled={notValid()} 
                                            onClick={() => !notValid() && setConfirmAddressDialog(true)}>
                                            { t('common.confirm') }
                                        </Button>
                                    </>
                            }
                        </StepContent>
                    </Step>
                    <Step key={1}>
                        <StepLabel onClick={() => setStep(1)}>
                            Generate Tx (At offline computer)
                        </StepLabel>
                        <StepContent>
                            {
                                mode === 'offline' ?
                                    <>
                                        <Alert severity="info">{t('safe_send.info2_offline')}</Alert>
                                        {
                                            !fileParsed && <> <FileReaderComp handleUpload={handleFile} color="info"></FileReaderComp> </>
                                        }
                                        {
                                            fileParsed && <>
                                                <Card container>
                                                    <Card item xs={3} sx={{ margin: 'auto 0', textAlign: 'center' }}>
                                                        { t('safe_send.from_address') }
                                                    </Card>
                                                    <Card item xs={7}>
                                                        <TextField
                                                            variant="standard"
                                                            sx={{ width: '100%' }}
                                                            value={fromAddress}
                                                            onChange={(ev) => {
                                                                setFromAddress(ev.target.value)
                                                            }}
                                                            disabled>
                                                        </TextField>
                                                    </Card>
                                                </Card>
                                                <Card container>
                                                    <Card item xs={3} sx={{ margin: 'auto 0', textAlign: 'center' }}>
                                                        { t('safe_send.to_address') }
                                                    </Card>
                                                    <Card item xs={7}>
                                                        <TextField
                                                            variant="standard"
                                                            sx={{ width: '100%' }}
                                                            value={toAddress}
                                                            onChange={(ev) => {
                                                                setToAddress(ev.target.value)
                                                            }}
                                                            disabled>
                                                        </TextField>
                                                    </Card>
                                                </Card>
                                                <Card container>
                                                    <Card item xs={3} sx={{ margin: 'auto 0', textAlign: 'center' }}>
                                                        { t('safe_send.amount') }
                                                    </Card>
                                                    <Card item xs={7}>
                                                        <TextField
                                                            variant="standard"
                                                            sx={{ width: '100%' }}
                                                            value={toAddress}
                                                            onChange={(ev) => {
                                                                setAmount(ev.target.value)
                                                            }}
                                                            disabled>
                                                        </TextField>
                                                    </Card>
                                                </Card>
                                                <Card container>
                                                    <Card item xs={3} sx={{ margin: 'auto 0', textAlign: 'center' }}>
                                                        { t('safe_send.fee') }
                                                    </Card>
                                                    <Card item xs={7}>
                                                        <TextField
                                                            variant="standard"
                                                            sx={{ width: '100%' }}
                                                            value={fee}
                                                            onChange={(ev) => {
                                                                setFee(ev.target.value)
                                                            }}
                                                            disabled>
                                                        </TextField>
                                                    </Card>
                                                </Card>
                                                <Button variant="contained" 
                                                    sx={{ marginTop: '10px', marginLeft: '20px' }}
                                                    color="success" onClick={() => setConfirmAddressDialog(true)}>{t('common.confirm')}</Button>
                                            </>
                                        }
                                    </>
                                    :
                                    <>
                                        <Alert severity="info">{t('safe_send.info2_online')}</Alert>
                                        <Button variant="contained" 
                                            sx={{ marginTop: '10px', marginLeft: '20px' }}
                                            color="success" onClick={() => setStep(2)}>{t('common.next')}</Button>
                                    </>
                            }
                        </StepContent>
                    </Step>
                    <Step key={2}>
                        <StepLabel onClick={() => setStep(2)}>
                            Broadcast Tx (At online computer)
                        </StepLabel>
                        <StepContent>
                            {
                                mode === 'offline' ? 
                                    <>
                                        <Alert severity="info">{t('safe_send.info3_offline')}</Alert>
                                    </>
                                    :
                                    <>
                                        <Alert severity="info">{t('safe_send.info3_online')}</Alert>
                                        {
                                            !fileParsed && <>
                                                <FileReaderComp handleUpload={handleFile} color="info"></FileReaderComp>
                                            </>
                                        }
                                        {
                                            fileParsed && <>
                                            <Card container>
                                                <Card item xs={3} sx={{ margin: 'auto 0', textAlign: 'center' }}>
                                                    { t('safe_send.from_address') }
                                                </Card>
                                                <Card item xs={7}>
                                                    <TextField
                                                        variant="standard"
                                                        sx={{ width: '100%' }}
                                                        value={fromAddress}
                                                        onChange={(ev) => {
                                                            setFromAddress(ev.target.value)
                                                        }}
                                                        disabled>
                                                    </TextField>
                                                </Card>
                                            </Card>
                                            <Card container>
                                                <Card item xs={3} sx={{ margin: 'auto 0', textAlign: 'center' }}>
                                                    { t('safe_send.to_address') }
                                                </Card>
                                                <Card item xs={7}>
                                                    <TextField
                                                        variant="standard"
                                                        sx={{ width: '100%' }}
                                                        value={toAddress}
                                                        onChange={(ev) => {
                                                            setToAddress(ev.target.value)
                                                        }}
                                                        disabled>
                                                    </TextField>
                                                </Card>
                                            </Card>
                                            <Card container>
                                                <Card item xs={3} sx={{ margin: 'auto 0', textAlign: 'center' }}>
                                                    { t('safe_send.amount') }
                                                </Card>
                                                <Card item xs={7}>
                                                    <TextField
                                                        variant="standard"
                                                        sx={{ width: '100%' }}
                                                        value={toAddress}
                                                        onChange={(ev) => {
                                                            setAmount(ev.target.value)
                                                        }}
                                                        disabled>
                                                    </TextField>
                                                </Card>
                                            </Card>
                                            <Card container>
                                                <Card item xs={3} sx={{ margin: 'auto 0', textAlign: 'center' }}>
                                                    { t('safe_send.fee') }
                                                </Card>
                                                <Card item xs={7}>
                                                    <TextField
                                                        variant="standard"
                                                        sx={{ width: '100%' }}
                                                        value={fee}
                                                        onChange={(ev) => {
                                                            setFee(ev.target.value)
                                                        }}
                                                        disabled>
                                                    </TextField>
                                                </Card>
                                            </Card>
                                            <Button variant="contained" 
                                                sx={{ marginTop: '10px', marginLeft: '20px' }}
                                                color="success" onClick={() => setConfirmAddressDialog(true)}>{t('common.confirm')}</Button>
                                            </>
                                        }
                                    </>
                            }
                        </StepContent>
                    </Step>
                </Stepper>

                <Dialog open={confirmAddressDialog} onClose={() => setConfirmAddressDialog(false)}>
                    <Card>
                        <CardHeader title={ t('send.enter_address') }></CardHeader>
                        <CardContent>
                            <TextField variant="filled" type="text" label="To Address"
                                value={repeatToAddress}
                                onChange={(ev) => setRepeatToAddress(ev.target.value)}
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
                        <CardHeader title={ t('send.going_to_send') + ' ' + amount  + 'QTUM ' + t('send.to_address') + ' ' + toAddress + ' '+ t('common.question_mark') }></CardHeader>
                        <CardActions>
                            <Grid container justifyContent="flex-end" direction="row">
                                <Button variant="contained" className="blue--text" color="success" onClick={confirmSend}>{t('common.confirm')}</Button>
                                <Button variant="contained" className="red--text" color="error" onClick={() => setConfirmSendDialog(false)}>{t('common.cancel')}</Button>
                            </Grid>
                        </CardActions>
                    </Card>
                </Dialog>
            </CardContent>

            <Snackbar open={error} autoHideDuration={6000} onClose={() => setError(false)}>
                <Alert onClose={() => setError(false)} severity={errorType} sx={{ width: '100%' }}>
                    { config.getNotifyMessage(errorMsg, t) }
                </Alert>
            </Snackbar>
        </Card>
    )

    function notValid() {
        const amountCheck = /^\d+\.?\d*$/.test(amount) && amount > 0
        const feeCheck = /^\d+\.?\d*$/.test(fee) && fee > 0.0001
        return !(amountCheck && feeCheck && fromAddress && toAddress)
    }

    async function createInfoFile() {
        setStep(1)
        setConfirmSendDialog(false)
        const utxoList = await server.currentNode().getUtxoList(fromAddress)
        const saveInfo = JSON.stringify({
            from: fromAddress,
            to: toAddress,
            amount: amount,
            fee: fee,
            utxo: utxoList
        })
        const blob = new Blob([saveInfo], {
            type: 'text/plain;charset=utf-8'
        })
        fileSaver.saveAs(
            blob,
            fromAddress + '_' + new Date().getTime() + '.raw'
        )
    }

    async function createTxFile() {
        setStep(2)
        setConfirmSendDialog(false)

        const offLineWallet = webWallet.getWallet()
        const rawTx = await wallet.generateTx(
            offLineWallet,
            toAddress,
            amount,
            fee,
            utxo
        )
        const saveInfo = JSON.stringify({
            from: fromAddress,
            to: toAddress,
            amount: amount,
            fee: fee,
            rawTx
        })
        fileSaver.saveAs(
            new Blob([saveInfo], {
                type: 'text/plain;charset=utf-8'
            }),
            fromAddress + '_' + new Date().getTime() + '.tx'
        )
    }

    function handleFile(file) {
        try {
            const info = JSON.parse(file.content)
            const newFromAddress = info.from
            setFromAddress(newFromAddress)
            setToAddress(info.to)
            setAmount(info.amount)
            setFee(info.fee)

            if (mode === 'offline') {
                setUtxo(info.utxo)
                const offLineWallet = webWallet.getWallet()
                if (offLineWallet.getAddress() !== newFromAddress) {
                    setError(true)
                    setErrorType('error')
                    setErrorMsg('from_address_is_not_same_as_the_wallet')
                    return false
                }
            } else {
                if (!info.rawTx) {
                    setError(true)
                    setErrorType('error')
                    setErrorMsg('file parse fail')
                    return false
                }
                setRawTx(info.rawTx)
            }

            setFileParsed(true)
        } catch (e) {
            setError(true)
            setErrorType('error')
            setErrorMsg('file parse fail')
            return false
        }
    }

    function confirmAddress() {
        if (toAddress !== repeatToAddress) {
            setError(true)
            setErrorType('error')
            setErrorMsg('address_is_not_same_as_the_old_one')
            return false
        }
        setConfirmAddressDialog(false)
        setConfirmSendDialog(true)
    }
  
    async function confirmSend() {
        if (step === 0) {
            await createInfoFile()
        } else if (step === 1) {
            await createTxFile()
        } else if (step === 2) {
            try {
                const res = await wallet.sendRawTx(rawTx)
                this.confirmSendDialog = false
                setConfirmSendDialog(false)
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
            } catch (e) {
                alert(e.message || e)
                setConfirmSendDialog(false)
            }
        }
    }
}

export default withNamespaces()(SafeSend)