import { withNamespaces } from 'react-i18next';
import { Button, CardActions, CardContent, Grid, Paper, TextField, InputAdornment, Dialog, Card, CardHeader, Snackbar, Alert } from '@mui/material';
import { useRef, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import ReplayIcon from '@mui/icons-material/Replay';
import '../../assets/less/head-action.less'
import abi from 'ethjs-abi'
import qtum from 'qtumjs-lib'
import server from '../../libs/server'
import config from '../../libs/config'

const addAbi = {
    name: 'addDelegation',
    inputs: [
      { name: 'staker', type: 'address' },
      { name: 'fee', type: 'uint8' },
      { name: 'PoD', type: 'bytes' }
    ]
}

const rules = {
    required: value => !!value || 'Required.'
}

function HeadAction(props) {
    const { t, wallet, handleNotify } = props

    const [addDelegationDialog, setAddDelegationDialog] = useState(false)
    const [formValidate, setFormValidate] = useState(false)
    const [contractAddress, setcontractAddress] = useState('0000000000000000000000000000000000000086')
    const [txFee, setTxFee] = useState('0.01')
    const [stakerAddress, setStakerAddress] = useState('')
    const [fee, setFee] = useState(10)
    const [gasLimit, setGasLimit] = useState('2500000')
    const [gasPrice, setGasPrice] = useState(40)

    const [error, setError] = useState(false)
    const [errorType, setErrorType] = useState('error')
    const [errorMsg, setErrorMsg] = useState('')

    const addDelegationForm = useRef()

    return (
        <section className="delegation-head-action">
            <section className="main">
                <section className="title">
                    { t('delegation.add') }
                </section>
                <section>
                    <Button variant="contained" color="success" onClick={() => delegateStatus() === 'none' && checkDelegation()}>
                        <AddIcon></AddIcon>
                    </Button>
                    <Button variant="contained" color="error" onClick={refreshData}>
                        <ReplayIcon></ReplayIcon>
                    </Button>
                </section>
            </section>

            <Dialog open={addDelegationDialog} onClose={() => setAddDelegationDialog(false)}>
                <Card sx={{width: '500px'}}>
                    <CardHeader title={ t('delegation.add') }></CardHeader>
                    <CardContent>
                        <form ref={addDelegationForm}>
                            <Grid container sx={{ marginTop: '10px' }}>
                                <Grid item xs={12}>
                                    <TextField type="text" label={t('common.info.staker_address')} sx={{width: '100%'}} required
                                        value={stakerAddress}
                                        onChange={(ev) => setStakerAddress(ev.target.value)}
                                        />
                                </Grid>
                            </Grid>
                            <Grid container sx={{ marginTop: '10px' }}>
                                <Grid item xs={12}>
                                    <TextField type="text" label={t('common.info.fee')} sx={{width: '100%'}} required
                                        value={fee}
                                        onChange={(ev) => setFee(ev.target.value)}
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                                        }}
                                        />
                                </Grid>
                            </Grid>
                            <Grid container sx={{ marginTop: '10px' }}>
                                <Grid item xs={12}>
                                    <TextField type="text" label={t('common.info.address')} sx={{width: '100%'}} disabled
                                        value={address()}
                                        />
                                </Grid>
                            </Grid>
                            <Grid container sx={{ marginTop: '10px' }}>
                                <Grid item xs={12}>
                                    <TextField type="number" label={t('common.info.gas_limit')} sx={{width: '100%'}}
                                        value={gasLimit}
                                        onChange={(ev) => setGasLimit(ev.target.value)}
                                        />
                                </Grid>
                            </Grid>
                            <Grid container sx={{ marginTop: '10px' }}>
                                <Grid item xs={12}>
                                    <TextField type="number" label={t('common.info.gas_price')} sx={{width: '100%'}}
                                        value={gasPrice}
                                        onChange={(ev) => setGasPrice(ev.target.value)}
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">e-8 Qtum/gas</InputAdornment>,
                                        }}
                                        />
                                </Grid>
                            </Grid>
                            <Grid container sx={{ marginTop: '10px' }}>
                                <Grid item xs={12}>
                                    <TextField type="number" label={t('common.info.tx_fee')} sx={{width: '100%'}}
                                        value={txFee}
                                        onChange={(ev) => setTxFee(ev.target.value)}
                                        inputProps={
                                            {step: '0.01'}
                                        }
                                        />
                                </Grid>
                            </Grid>
                        </form>
                    </CardContent>
                    <CardActions>
                        <Grid container justifyContent="flex-end" direction="row">
                            <Button variant="contained" className="blue--text" color="success" onClick={confirmSend}>{t('common.confirm')}</Button>
                            <Button variant="contained" className="red--text" color="error" onClick={() => setAddDelegationDialog(false)}>{t('common.cancel')}</Button>
                        </Grid>
                    </CardActions>
                </Card>
            </Dialog>
            <Snackbar open={error} autoHideDuration={6000} onClose={() => setError(false)}>
                <Alert onClose={() => setError(false)} severity={errorType} sx={{ width: '100%' }}>
                    { config.getNotifyMessage(errorMsg, t) }
                </Alert>
            </Snackbar>
        </section>
    )

    function superStaker() {
        return wallet.info.superStaker
    }
    
    function address() {
        return wallet.info.address
    }
    
    function keyPair() {
        return wallet.info.keyPair
    }
    
    function delegateStatus() {
        return wallet.info.delegateStatus
    }

    async function confirmSend() {
        // ??????????????????
        // debugger
        if (!addDelegationForm.current.checkValidity()) {
            return
        }
        // if (!this.formValidate) return
  
        // ?????????????????? hex
        try {
            const hexAddress = qtum.address
                .fromBase58Check(stakerAddress)
                .hash.toString('hex')
    
            // ?????????????????????????????????
            var signature = '0x' + wallet.signMessage(hexAddress).toString('hex')
    
            // ??????????????????
            const params = ['0x' + hexAddress, fee, signature]
    
            // ?????? abi
            const encodedData = abi.encodeMethod(addAbi, params).substr(2)
    
            // ?????????????????? raw tx
            const rawTx = await wallet.generateSendToContractTx(
                contractAddress,
                encodedData,
                gasLimit,
                gasPrice,
                txFee
            )
    
            // ????????????
            const res = await wallet.sendRawTx(rawTx)
    
            // ??????????????????
            if (res.txId) {
                // ??????????????????
                wallet.setDelegation(stakerAddress, fee)
                wallet.setDelegationStatus('addDelegation')
        
                const txViewUrl = server.currentNode().getTxExplorerUrl(res.txId)

                setError(true)
                setErrorType('success')
                setErrorMsg(`Successful send. You can view at <a href="${txViewUrl}" target="_blank">${txViewUrl}</a>`)
    
                setAddDelegationDialog(false)
            } else {
                setError(true)
                setErrorType('error')
                setErrorMsg(`Send Failed : ${res.message}`)
            }
        } catch (e) {
            setError(true)
            setErrorType('error')
            setErrorMsg(`Send Failed : ${e.message}`)
        }
    }

    function checkDelegation() {
        if (superStaker()) {
            handleNotify(t('delegation.delegated'), 'error')
            return
        }
        setStakerAddress('')
        setAddDelegationDialog(true)
    }

    async function refreshData() {
        await wallet.setInfo()
        handleNotify(t('delegation.refresh_success'), 'success')
    }
}

export default withNamespaces()(HeadAction)