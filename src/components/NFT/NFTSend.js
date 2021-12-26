import { withNamespaces } from 'react-i18next';
import { Button, Card, CardHeader, Grid, CardContent, TextField, Dialog, CardActions, Snackbar, Alert } from '@mui/material';
import { useState } from 'react';
import { nftService } from '../../libs/nft'
import webWallet from '../../libs/web-wallet'
import '../../assets/less/nft-send.less'

const rules = {
    required: (value) => !!value || 'Required.',
    counter: (value) => {
        const isValid = value <= this.count && value > 0 && value % 1 === 0
        return isValid || `max value ${this.count} and min value 1, must Integer`
    }
}

function NFTSend(props) {
    const { t, isOpen, count, tokenId, handleClose } = props
    
    const [gasPrice, setGasPrice] = useState('40')
    const [gasLimit, setGasLimit] = useState('2500000')
    const [fee, setFee] = useState('0.01')
    const [to, setTo] = useState('')
    const [sendCount, setSendCount] = useState(1)
    const [wallet, setWallet] = useState(webWallet.getWallet())
    const [error, setError] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    return (
        <Grid container justifyContent="center" alignItems="center">
            <Dialog open={isOpen} onClose={handleClose}>
                <Card sx={{ width: '500px' }}>
                    <CardHeader title={t('nft.send_nft')}>
                    </CardHeader>
                    <CardContent>
                        <Grid container sx={{ marginTop: '10px' }}>
                            <Grid item xs={12}>
                                <TextField type="text" label={t('nft.send_address')} sx={{width: '100%'}} required
                                    value={to}
                                    onChange={(ev) => setTo(ev.target.value)}
                                    />
                            </Grid>
                        </Grid>
                        <Grid container sx={{ marginTop: '10px' }}>
                            <Grid item xs={10}>
                                <TextField type="number" label={t('nft.send_amount')} sx={{width: '100%'}} required
                                    value={sendCount}
                                    onChange={(ev) => setSendCount(ev.target.value)}
                                    onInput={handleInputAmount}
                                    />
                            </Grid>
                            <Grid item xs={2} sx={{ margin: 'auto 0', textAlign: 'center' }}>
                                <span>{ count }</span>
                            </Grid>
                        </Grid>
                        <Grid container sx={{ marginTop: '10px' }}>
                            <Grid item xs={12}>
                                <TextField type="text" label="Gas Price" sx={{width: '100%'}} required
                                    value={gasPrice}
                                    onChange={(ev) => setGasPrice(ev.target.value)}
                                    />
                            </Grid>
                        </Grid>
                        <Grid container sx={{ marginTop: '10px' }}>
                            <Grid item xs={12}>
                                <TextField type="text" label="Gas Limit" sx={{width: '100%'}} required
                                    value={gasLimit}
                                    onChange={(ev) => setGasLimit(ev.target.value)}
                                    />
                            </Grid>
                        </Grid>
                        <Grid container sx={{ marginTop: '10px' }}>
                            <Grid item xs={12}>
                                <TextField type="text" label="fee" sx={{width: '100%'}} required
                                    value={fee}
                                    onChange={(ev) => setFee(ev.target.value)}
                                    />
                            </Grid>
                        </Grid>
                    </CardContent>
                    <CardActions>
                        <Grid container justifyContent="flex-end" direction="row">
                            <Button variant="contained" color="error" onClick={handleClose}>{t('nft.close_confirm')}</Button>
                            <Button variant="contained" color="primary" onClick={handleConfirmSend}>{t('nft.send_confirm')}</Button>
                        </Grid>
                    </CardActions>
                </Card>
            </Dialog>
            <Snackbar open={error} autoHideDuration={6000} onClose={() => setError(false)}>
                <Alert onClose={() => setError(false)} severity="error" sx={{ width: '100%' }}>
                    { errorMsg }
                </Alert>
            </Snackbar>
        </Grid>
    )
    
    function handleInputAmount(e) {
        const val = parseInt(e.target.value)
        const oldVal = sendCount
        if (val < 1) {
            setSendCount(1)
            return false
        }
        if (!val) {
            setSendCount(oldVal)
            return false
        }
        if (val > count) {
            setSendCount(9)
            // this.$emit('input', sendCount)
            return false
        }
        setSendCount(val)
    }

    async function handleConfirmSend() {
        const newWallet = webWallet.getWallet()

        setWallet(newWallet)

        const {
            info: { address }
        } = newWallet
        if (
            address &&
            newWallet.validateAddress(address) &&
            to &&
            tokenId !== '' &&
            count >= sendCount > 0 &&
            count % 1 === 0
        ) {
            try {
                const res = await nftService.safeTransferFrom(
                    address,
                    to,
                    tokenId,
                    sendCount
                )
                const txViewUrl = server.currentNode().getTxExplorerUrl(res.txId)
                if (txViewUrl) {
                    setError(true)
                    setErrorMsg(`Successful send. You can view wallet into <a href="${txViewUrl}">${txViewUrl}</a>`)
                    handleClose()
                } else {
                    setErrorMsg('Send Failed : tx is fail')
                }
            } catch (error) {
                setError(true)
                setErrorMsg(`Send Failed : ${error.message}`)
            }
        } else {
            setError(true)
            setErrorMsg('Send Failed : check params is error')
        }
    }
}

export default withNamespaces()(NFTSend)