import { withNamespaces } from 'react-i18next';
import { Button, CardActions, CardContent, Grid, TextField, InputAdornment, Dialog, Card, CardHeader, Snackbar, Alert, Fab } from '@mui/material';
import { useRef, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import ReplayIcon from '@mui/icons-material/Replay';
import '../../assets/less/info.less'
import abi from 'ethjs-abi'
import qtum from 'qtumjs-lib'
import server from '../../libs/server'
import config from '../../libs/config'
import CloseIcon from '@mui/icons-material/Close';

const removeAbi = { name: 'removeDelegation', inputs: [] }

function Info(props) {
    const { t, wallet, handleNotify } = props

    const [removeDelegationDialog, setRemoveDelegationDialog] = useState(false)
    const [contractAddress, setContractAddress] = useState('0000000000000000000000000000000000000086')
    const [txFee, setTxFee] = useState('0.01')
    const [gasLimit, setGasLimit] = useState('2500000')
    const [gasPrice, setGasPrice] = useState(40)

    const [error, setError] = useState(false)
    const [errorType, setErrorType] = useState('error')
    const [errorMsg, setErrorMsg] = useState('')

    return (
        <section className="delegation-list">
            <section className="delegation-list__item">
                <section className="delegation-list__left">
                    <div className="header">
                        <span className="name text--lighten-4" className={textColor()}>Fee</span>
                        <span className="fee" className={textColor()}>( { fee() }% )</span>
                    </div>
                    <span className={textColor()}>{t("delegation.address") + ' ' + address()}</span><br />
                    <span className={textColor()}>{t("delegation.super_staker") + ' ' + superStaker()}</span>
                </section>

                <section className="delegation-list__right">
                    <div className="balance text--lighten-4" className={textColor()}>
                        { balance() }
                    </div>
                    <Fab color="primary" onClick={checkDelDelegation}>
                        <CloseIcon />
                    </Fab>
                </section>
            </section>
            
            <Dialog open={removeDelegationDialog} onClose={() => setRemoveDelegationDialog(false)}>
                <Card sx={{width: '500px'}}>
                    <CardHeader title={ t('delegation.add') }></CardHeader>
                    <CardContent>
                        <form>
                            <Grid container sx={{ marginTop: '10px' }}>
                                <Grid item xs={12}>
                                    <TextField type="text" label={t('common.info.staker_address')} sx={{width: '100%'}} disabled
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
                            <Button variant="contained" className="blue--text" color="success" onClick={removeDelegation}>{t('common.confirm')}</Button>
                            <Button variant="contained" className="red--text" color="error" onClick={() => setRemoveDelegationDialog(false)}>{t('common.cancel')}</Button>
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
    
    function fee() {
        return wallet.info.fee
    }
    
    function address() {
        return wallet.info.address
    }

    function balance() {
        return wallet.info.balance
    }

    function textColor() {
        let color = ''
        switch (wallet.info.delegateStatus) {
            case 'addDelegation':
            case 'delDelegation':
                color = 'red'
            break
            case 'delegated':
                color = 'blue'
            break
        }
        return color + '--text'
    }

    async function removeDelegation() {
        try {
            // 编码 abi
            const encodedData = abi.encodeMethod(removeAbi, []).substr(2)
            // 把交易编码成 raw tx
            const rawTx = await wallet.generateSendToContractTx(
                contractAddress,
                encodedData,
                gasLimit,
                gasPrice,
                txFee
            )
            // 发送交易
            const res = await wallet.sendRawTx(rawTx)
    
            // 合约调用成功
            if (res.txId) {
                const txViewUrl = server.currentNode().getTxExplorerUrl(res.txId)
                
                setError(true)
                setErrorType('success')
                setErrorMsg(`Successful send. You can view at <a href="${txViewUrl}" target="_blank">${txViewUrl}</a>`)
    
                // 临时删除
                wallet.setDelegation('', '')
                wallet.setDelegationStatus('delDelegation')
    
                setRemoveDelegationDialog(false)
            }
        } catch (error) {
            handleNotify(error.message, 'error')
            setRemoveDelegationDialog(false)
        }
    }

    function checkDelDelegation() {
        if (wallet.info.delegateStatus !== 'delegated') {
            handleNotify(t('delegation.processing'), 'error')
            return
        }
        setRemoveDelegationDialog(false)
    }
}

export default withNamespaces()(Info)