import { useEffect, useState } from 'react'
import { Card, CardHeader, CardContent, TextField, Snackbar, Alert, CardActions, Grid, CircularProgress, Button, Dialog, Select, MenuItem, InputLabel } from '@mui/material'
import { withNamespaces } from 'react-i18next';
import webWallet from '../libs/web-wallet'
import config from '../libs/config'
import server from '../libs/server'
import track from '../libs/track'
import FileCreator from '../components/FileCreator';
import Upload from 'rc-upload'
import AddIcon from '@mui/icons-material/Add';

const loadConfig = {
    lan: config.getLan(),
    network: config.getNetwork(),
    mode: config.getMode()
}

function Config(props) {
    const { t } = props
    
    const [lan, setLan] = useState(config.getLan())
    const [network, setNetwork] = useState(config.getNetwork())
    const [mode, setMode] = useState(config.getMode())
    
    const lanSelect = [
        { value: 'zh', text: '中文' },
        { value: 'en', text: 'En' },
        { value: 'ko', text: '한글' }
    ]
    
    const networkSelect = [
        { value: 'testnet', text: t('common.testnet') },
        { value: 'mainnet', text: t('common.mainnet') }
    ]
    
    const modeSelect = [
        { value: 'normal', text: t('common.mode.normal') },
        { value: 'offline', text: t('common.mode.offline') }
    ]
    

    return (
        <Card>
            <CardHeader title={ t('config.title') }></CardHeader>
            <CardContent>
                <Grid container sx={{ marginTop: '10px' }}>
                    <Grid item xs={6} sx={{ margin: 'auto 0' }}>
                        { t('config.lan') }
                    </Grid>
                    <Grid item xs={6}>
                        <Select
                            // label="Method"
                            // labelId="demo-simple-select-label"
                            value={lan}
                            onChange={(e) => setLan(e.target.value)}
                            sx={{width: '100%', color: 'white'}}
                        >
                            {
                                lanSelect && lanSelect.map((item, i) => 
                                    <MenuItem key={i} value={item.value}> { item.text } </MenuItem>
                                )
                            }
                        </Select>
                    </Grid>
                </Grid>
                <Grid container sx={{ marginTop: '10px' }}>
                    <Grid item xs={6} sx={{ margin: 'auto 0' }}>
                        { t('config.network') }
                    </Grid>
                    <Grid item xs={6}>
                        <Select
                            // label="Method"
                            // labelId="demo-simple-select-label"
                            value={network}
                            onChange={(e) => setNetwork(e.target.value)}
                            sx={{width: '100%', color: 'white'}}
                        >
                            {
                                networkSelect && networkSelect.map((item, i) => 
                                    <MenuItem key={i} value={item.value}> { item.text } </MenuItem>
                                )
                            }
                        </Select>
                    </Grid>
                </Grid>
                <Grid container sx={{ marginTop: '10px' }}>
                    <Grid item xs={6} sx={{ margin: 'auto 0' }}>
                        { t('config.mode') }
                    </Grid>
                    <Grid item xs={6}>
                        <Select
                            // label="Method"
                            // labelId="demo-simple-select-label"
                            value={mode}
                            onChange={(e) => setMode(e.target.value)}
                            sx={{width: '100%', color: 'white'}}
                        >
                            {
                                modeSelect && modeSelect.map((item, i) => 
                                    <MenuItem key={i} value={item.value}> { item.text } </MenuItem>
                                )
                            }
                        </Select>
                    </Grid>
                </Grid>
                <Grid container sx={{ marginTop: '10px' }}>
                    <Grid item xs={6} sx={{ margin: 'auto 0' }}>
                        LOG
                    </Grid>
                    <Grid item xs={6}>
                        <FileCreator color="error" href={fileStr()} handleClick={() => {}}></FileCreator>
                    </Grid>
                </Grid>
            </CardContent>
            <CardActions>
                <Grid container justifyContent="flex-end" direction="row">
                    <Button variant="contained" color="success" onClick={() => save() }>{t('common.confirm')}</Button>
                </Grid>
            </CardActions>

        </Card>
    )

    function fileStr() {
    //   return 'data:text/plain,' + this.$root.log.exportToArray().join('\n')
      return 'data:text/plain,' + 'log'
    }

    function saveKey(key) {
        let curV = ''
        switch (key) {
            case 'lan':
                curV = lan
                break
            case 'network':
                curV = network
                break
            case 'mode':
                curV = mode
                break
        }

        if (curV !== loadConfig[key]) {
            track.trackAction(
                'change',
                'config',
                `${key} : ${loadConfig[key]} => ${curV}`
            )
        }
        config.set(key, curV)
    }
    
    function save() {
        saveKey('lan')
        saveKey('network')
        saveKey('mode')
        window.location.reload()
    }
}

export default withNamespaces()(Config)