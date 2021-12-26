import { useEffect, useState } from 'react'
import { Card, CardHeader, CardContent, TextField, Snackbar, Alert, CardActions, Grid, CircularProgress, Button, Dialog, Select, MenuItem, InputLabel } from '@mui/material'
import { withNamespaces } from 'react-i18next';
import webWallet from '../libs/web-wallet'
import config from '../libs/config'
import server from '../libs/server'
import { nftService } from '../libs/nft'
import abiModule from 'ethjs-abi'
import '../assets/less/create-nft.less'
import Upload from 'rc-upload'
import AddIcon from '@mui/icons-material/Add';

const rules = {
    required: (value) => !!value || 'Required.',
    totalSupply: (value) => {
        const isValid = value <= 10 && value > 0 && value % 1 === 0
        return isValid || 'max value 10 and min value 1, must Integer'
    }
}

function CreateNFT(props) {
    const { t } = props
    
    const [name, setName] = useState('')
    const [desc, setDesc] = useState('')
    const [totalSupply, setTotalSupply] = useState(1)

    const [gasPrice, setGasPrice] = useState('40')
    const [gasLimit, setGasLimit] = useState('2500000')
    const [fee, setFee] = useState('0.01')
    const [rawTx, setRawTx] = useState('loading...')
    const [confirmSendDialog, setConfirmSendDialog] = useState(false)
    
    const [notValid, setNotValid] = useState(false)
    const [isUpload, setIsUpload] = useState(false)

    const [showUploadUrl, setShowUploadUrl] = useState('')
    const [uploadUrl, setUploadUrl] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const [wallet, setWallet] = useState(webWallet.getWallet())
    const [attrs, setAttrs] = useState({ accept: 'image/*' })

    const [error, setError] = useState(false)
    const [errorType, setErrorType] = useState('error')
    const [errorMsg, setErrorMsg] = useState('')

    return (
        <Card>
            <CardHeader title={ t('nft.create_title') }></CardHeader>
            <CardContent>
                <Upload
                    className="nft-img__uploader"
                    accept="image/*"
                    beforeUpload={beforeAvatarUpload}
                    onSuccess={handleFileComplete}
                    action="https://api.qtumwallet.org/picture/upload"
                    >
                    <div className="nft-img__upload">
                        {
                            !isUpload && <>
                                { !isUploading && <AddIcon></AddIcon> }
                                { isUploading && <span>uploading...</span> }
                            </>
                        }
                        {
                            isUpload && <img src={showUploadUrl} className={'nft-img__img'} alt="img" />
                        }
                    </div>
                </Upload>
                <TextField
                    variant="standard"
                    label={t('nft.create_name')}
                    sx={{ width: '100%', marginTop: '10px' }}
                    value={name}
                    onChange={(ev) => {
                        setName(ev.target.value)
                    }}
                    required>
                </TextField>
                <TextField
                    variant="standard"
                    label={t('nft.create_desc')}
                    sx={{ width: '100%', marginTop: '10px' }}
                    value={desc}
                    onChange={(ev) => {
                        setDesc(ev.target.value)
                    }}
                    required>
                </TextField>
                <TextField
                    variant="standard"
                    label={t('nft.create_supply')}
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
                    <Button variant="contained" color="success" onClick={() => handleSend() }>{t('common.confirm')}</Button>
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
                </Card>
            </Dialog>
            
            <Snackbar open={error} autoHideDuration={6000} onClose={() => setError(false)}>
                <Alert onClose={() => setError(false)} severity={errorType} sx={{ width: '100%' }}>
                    { config.getNotifyMessage(errorMsg, t) }
                </Alert>
            </Snackbar>
        </Card>
    )

    async function handleSend() {
        try {
            const {
                info: { address }
            } = wallet
            if (
                address &&
                name &&
                desc &&
                10 >= totalSupply > 0 &&
                totalSupply % 1 === 0
            ) {
                const res = await nftService.createNFT(
                    address,
                    name,
                    uploadUrl,
                    desc,
                    totalSupply,
                    gasPrice,
                    gasLimit,
                    fee
                )
                const txViewUrl = server.currentNode().getTxExplorerUrl(res.txId)
                if (txViewUrl && res.txId) {
                    setError(true)
                    setErrorType('success')
                    setErrorMsg(`Successful send. You can view wallet into <a href="${txViewUrl}">${txViewUrl}</a>`)
                } else {
                    setError(true)
                    setErrorType('error')
                    setErrorMsg('Send Failed : tx is fail')
                }
            }
        } catch (error) {
            setError(true)
            setErrorType('error')
            setErrorMsg(`Send Failed : ${error.message}`)
        }
    }

    function beforeAvatarUpload(file) {
        setIsUploading(true)
        setIsUpload(false)
        setUploadUrl('')
        setShowUploadUrl('')

        const isImage = file.type.indexOf('image/') !== -1
        const isLimitSize = file.size / 1024 / 1024 < 10
        if (!isImage) {
            setError(true)
            setErrorType('error')
            setErrorMsg('file type is error')
        }
  
        if (!isLimitSize) {
            setError(true)
            setErrorType('error')
            setErrorMsg('file size is limit 10m')
        }
        return isImage && isLimitSize
    }

    function handleFileComplete(res, file) {
        setShowUploadUrl(URL.createObjectURL(file))
        setUploadUrl(res.url)
        setIsUpload(true)
        setIsUploading(false)
    }
}

export default withNamespaces()(CreateNFT)