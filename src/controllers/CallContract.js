import { useEffect, useState } from 'react'
import { Card, CardHeader, CardContent, TextField, Snackbar, Alert, CardActions, Grid, CircularProgress, Button, Dialog, Select, MenuItem, InputLabel } from '@mui/material'
import { withNamespaces } from 'react-i18next';
import webWallet from '../libs/web-wallet'
import config from '../libs/config'
import server from '../libs/server'
import abiModule from 'ethjs-abi'


function CallContract(props) {
    const { t } = props
    
    const [contractAddress, setContractAddress] = useState('')
    const [abi, setAbi] = useState('')
    const [parsedAbi, setParsedAbi] = useState(null)
    const [method, setMethod] = useState(null)
    const [inputParams, setInputParams] = useState([])
    const [execResultDialog, setExecResultDialog] = useState(false)
    const [result, setResult] = useState('loading...')

    const [error, setError] = useState(false)
    const [errorType, setErrorType] = useState('error')
    const [errorMsg, setErrorMsg] = useState('')

    useEffect(() => {
        setInputParams([])
    }, [method])

    return (
        <Card>
            <CardHeader title={ t('call_contract.title') }></CardHeader>
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
                    minRows={4}
                    maxRows={6}
                    onInput={decodeAbi}>
                </TextField>
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
                            parsedAbi && parsedAbi.map((item, i) => 
                                <MenuItem key={i} value={item}> { item } </MenuItem>
                            )
                        }
                    </Select>
                </>
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
            </CardContent>
            <CardActions>
                <Grid container justifyContent="flex-end" direction="row">
                    <Button variant="contained" color="success" onClick={() => !notValid() && callTo() }>{t('common.confirm')}</Button>
                </Grid>
            </CardActions>

            <Dialog open={execResultDialog} onClose={() => setExecResultDialog(false)}>
                <Card>
                    <CardHeader title={ t('call_contract.result') }></CardHeader>
                    <CardContent>
                        <TextField variant="filled" type="text" label="Result"
                            value={result}
                            // onChange={(ev) => setResult(ev.target.value)}
                            sx={{width: '100%'}} 
                            // disabled
                            multiline
                            maxRows={6}
                            >
                        </TextField>
                    </CardContent>
                    <CardActions>
                        <Grid container justifyContent="flex-end" direction="row">
                            <Button variant="contained" className="blue--text" color="success" onClick={() => setExecResultDialog(false)}>{t('common.confirm')}</Button>
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

    function params() {
        if (method === null) {
            return null
        }

        const inputs = method.info.inputs
        if (inputs.length > 0) {
            return inputs
        }
        return null
    }

    function notValid() {
        //@todo valid the address
        return !(method !== null)
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

    async function callTo() {
        try {
            const encodedData = abiModule
                .encodeMethod(method.info, inputParams)
                .substr(2)
            setExecResultDialog(true)
            try {
                setResult(await webWallet
                    .getWallet()
                    .callContract(contractAddress, encodedData))
            } catch (e) {
                alert(e.message || e)
                setExecResultDialog(false)
            }
        } catch (e) {
            setError(true)
            setErrorType('error')
            setErrorMsg('Params error')
            return false
        }
    }

    function updateInputParams(index, value) {
        const newInputParams = [...inputParams]
        newInputParams[index] = value
        setInputParams(newInputParams)
    }
}

export default withNamespaces()(CallContract)