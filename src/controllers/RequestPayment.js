import { useEffect, useState } from 'react'
import { Card, CardHeader, CardContent, TextField, Grid } from '@mui/material'
import { withNamespaces } from 'react-i18next';
import webWallet from '../libs/web-wallet'
import qrcode from 'qrcode'

function RequestPayment(props) {
    const { t } = props
    
    const [address, setAddress] = useState(webWallet.getWallet().getAddress())
    const [amount, setAmount] = useState('0.0')
    const [message, setMessage] = useState('')
    const [qr, setQr] = useState('')

    useEffect(() => {
        drawQrCode()
    }, [])

    return (
        <Card>
            <CardHeader title={ t('request_payment.title') }></CardHeader>
            <CardContent>
                <Grid container sx={{ marginTop: '10px' }}>
                    <Grid item xs={12}>
                        <TextField type="text" label="Address" sx={{width: '100%'}} required disabled
                            value={address}
                            onChange={(ev) => setAddress(ev.target.value)}
                            onInput={(ev) => drawQrCode()}
                            />
                    </Grid>
                </Grid>
                <Grid container sx={{ marginTop: '10px' }}>
                    <Grid item xs={12}>
                        <TextField type="text" label="Amount" sx={{width: '100%'}} required
                            value={amount}
                            onChange={(ev) => setAmount(ev.target.value)}
                            onInput={(ev) => drawQrCode()}
                            />
                    </Grid>
                </Grid>
                <Grid container sx={{ marginTop: '10px' }}>
                    <Grid item xs={12}>
                        <TextField type="text" label="Message" sx={{width: '100%'}} required
                            value={amount}
                            onChange={(ev) => setMessage(ev.target.value)}
                            onInput={(ev) => drawQrCode()}
                            />
                    </Grid>
                </Grid>
                
                <Grid container sx={{ marginTop: '10px' }}>
                    <Grid item xs={12}>
                        <div style={{textAlign: 'center'}}>
                            <img src={qr}/>
                        </div>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )

    function drawQrCode() {
        qrcode.toDataURL(
            `qtum:${address}?amount=${amount}&message=${message}`,
            (err, url) => {
                setQr(url)
            }
        )
    }
}

export default withNamespaces()(RequestPayment)