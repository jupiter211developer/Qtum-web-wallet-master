import { useState } from 'react';
import { withNamespaces } from 'react-i18next';
import webWallet from '../libs/web-wallet'
import store from 'store'
import { Grid, CardContent, Table, TableHead, TableBody, TableRow, TableCell, Button, Fab, TableFooter, CardHeader, CardActions, TextField, Dialog, Card, CircularProgress } from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteIcon from '@mui/icons-material/Delete';

function DerivePath(props) {
    const { t, ledger, handleSetWallet } = props

    const [walletCache, setWalletCache] = useState({})
    const [hdNodeCache, setHdNodeCache] = useState({})
    const [posCache, setPosCache] = useState({})
    const [pathTypeList, setPathTypeList] = useState([{
        name: t('derive_path.default'),
        path: webWallet.getLedgerDefaultPath()
    }].concat(store.get('ledgerPath', [])))

    const [showPathForm, setShowPathForm] = useState(false)
    const [pathFormName, setPathFormName] = useState('')
    const [pathFormPathName, setPathFormPathName] = useState('')
    const [pathFormPath, setPathFormPath] = useState('')
    const [pathFormPathId, setPathFormPathId] = useState('')

    const [activePath, setActivePath] = useState(null)
    const [showAddressList, setShowAddressList] = useState(false)
    const [addressListLoading, setAddressListLoading] = useState(false)
    const [addressListPathName, setAddressListPathName] = useState('')
    const [addressListPath, setAddressListPath] = useState('')
    const [addressListPos, setAddressListPos] = useState(0)

    const [addressList, setAddressList] = useState([])

    return (
        <div>
            <p>{ t('derive_path.title') }</p>
            <CardContent>
                <Table sx={{ minWidth: 650, backgroundColor: '#424242', color: 'white !important' }} aria-label="simple table">
                    <TableBody sx={{ color: 'white' }}>
                        {pathTypeList.map((item, i) => (
                            <TableRow
                                key={i}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 }, color: 'white' }}
                            >
                                <TableCell align="left" sx={{ color: 'white', paddingTop: '3px', paddingBottom: '3px' }}>{item.name}</TableCell>
                                <TableCell align="right" sx={{ color: 'white', paddingTop: '3px', paddingBottom: '3px' }}>{item.path}</TableCell>
                                <TableCell align="right" sx={{ paddingTop: '3px', paddingBottom: '3px' }}>
                                    {
                                        item.id ? 
                                            (<>
                                                <Fab color="primary" onClick={() => editCusPath(item)}>
                                                    <ModeEditIcon />
                                                </Fab>
                                                <Fab sx={{backgroundColor: '#9c27b0'}} onClick={() => delCusPath(item.id)}>
                                                    <DeleteIcon />
                                                </Fab>
                                            </>) 
                                            :
                                            (<Fab color="primary" onClick={() => choosePath(item)}>
                                                <LockOpenIcon />
                                            </Fab>)
                                    }
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell sx={{ borderBottom: '0px' }}>
                                <Button color="info" variant="contained" onClick={addCusPath}>
                                    { t('derive_path.add_custom') }
                                </Button>
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </CardContent>
            <Grid container>
                <Dialog open={showPathForm} onClose={() => setShowPathForm(false)}>
                    <Card>
                        <CardHeader title={ pathFormName }></CardHeader>
                        <CardContent>
                            <TextField variant="filled" type="text" label={t('derive_path.path_name') + '*'}
                                value={pathFormPathName}
                                onChange={(ev) => setPathFormPathName(ev.target.value)}
                                sx={{width: '100%'}} 
                                >
                            </TextField>
                            <TextField variant="filled" type="text" label={t('derive_path.path') + '*'}
                                value={pathFormPath}
                                onChange={(ev) => setPathFormPath(ev.target.value)}
                                sx={{width: '100%'}} 
                                >
                            </TextField>
                        </CardContent>
                        <CardActions>
                            <Grid container justifyContent="flex-end" direction="row">
                                <Button variant="contained" color="success" onClick={savePathForm}>{t('common.confirm')}</Button>
                                <Button variant="contained" color="error" onClick={() => setShowPathForm(false)}>{t('common.cancel')}</Button>
                            </Grid>
                        </CardActions>
                    </Card>
                </Dialog>
            </Grid>
            <Grid container>
                <Dialog open={showAddressList} onClose={() => setShowAddressList(false)} fullWidth maxWidth="lg">
                    <Card>
                        <CardHeader title={ addressListPathName + ' ' + addressListPath }></CardHeader>
                        <CardContent>
                            <Table sx={{ minWidth: 900, backgroundColor: '#424242', color: 'white !important' }} aria-label="simple table">
                                <TableHead sx={{ backgroundColor: '#424242', color: 'white' }}>
                                    <TableRow>
                                        <TableCell align="left" sx={{ color: 'white !important' }}>Path</TableCell>
                                        <TableCell sx={{ color: 'white !important' }}>Address</TableCell>
                                        <TableCell sx={{ color: 'white !important' }}>Balance</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody sx={{ color: 'white' }}>
                                    {
                                        addressListLoading ?
                                            (
                                                <TableRow>
                                                    <TableCell sx={{borderBottom: '0px'}}>
                                                        <Grid container justifyContent="center" sx={{position: 'absolute', width: '80%'}}>
                                                            <CircularProgress />
                                                        </Grid>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                            :
                                            addressList.map((item, i) => (
                                                <TableRow
                                                    key={i}
                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, color: 'white' }}
                                                >
                                                    <TableCell align="left" sx={{ color: 'white', paddingTop: '3px', paddingBottom: '3px' }}>{ addressListPath + '/' + item.path }</TableCell>
                                                    <TableCell align="right" sx={{ color: 'white', paddingTop: '3px', paddingBottom: '3px' }}>{item.wallet.getAddress()}</TableCell>
                                                    <TableCell align="right" sx={{ color: 'white', paddingTop: '3px', paddingBottom: '3px' }}>{item.wallet.info.balance}</TableCell>
                                                    <TableCell align="right" sx={{ paddingTop: '3px', paddingBottom: '3px' }}>
                                                        <Fab color="primary" onClick={() => setWallet(item.wallet, item.path)}>
                                                            <LockOpenIcon />
                                                        </Fab>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                    }
                                    
                                </TableBody>
                            </Table>
                        </CardContent>
                        <CardActions>
                            <Grid container justifyContent="flex-end" direction="row">
                                { addressListPos > 0 && <Button variant="contained" color="success" onClick={prev10Address}>{t('derive_path.prev_10')}</Button> }
                                <Button variant="contained" color="success" onClick={next10Address}>{t('derive_path.next_10')}</Button>
                                <Button variant="contained" color="error" onClick={() => setShowAddressList(false)}>{t('common.cancel')}</Button>
                            </Grid>
                        </CardActions>
                    </Card>
                </Dialog>
            </Grid>
        </div>
    )

    function addCusPath() {
        setShowPathForm(true)
        setPathFormName(t('derive_path.add_custom'))
        setPathFormPathId(Date.now())
        setPathFormPathName('')
        setPathFormPath('')
    }

    function editCusPath(pathItem) {
        setShowPathForm(true)
        setPathFormName(t('derive_path.edit_custom'))
        setPathFormPathId(pathItem.id)
        setPathFormPathName(pathItem.name)
        setPathFormPath(pathItem.path)
    }

    function delCusPath(id) {
        if (confirm(t('derive_path.del_custom'))) {
            updateCusPath(id)
        }
    }

    function updateCusPath(id, data = undefined) {
        const cusPathList = store.get('ledgerPath', [])
        let i
        for (i = 0; i < cusPathList.length; i++) {
            if (cusPathList[i].id === id) {
                break
            }
        }
        cusPathList.splice(i, 1)

        const newPathTypeList = [...pathTypeList]
        newPathTypeList.splice(i + 1, 1)
        if (data !== undefined) {
            cusPathList.splice(i, 0, data)
            newPathTypeList.splice(i + 1, 0, data)
            setPathTypeList(newPathTypeList)
        }
        store.set('ledgerPath', cusPathList)
    }

    function savePathForm() {
        updateCusPath(pathFormPathId, {
            id: pathFormPathId,
            name: pathFormPathName,
            path: pathFormPath
        })

        setShowPathForm(false)
    }

    function choosePath(path) {
        setActivePath(path)
        if (posCache[path.path] === undefined) {
            posCache[path.path] = 0
        }

        setAddressListPos(posCache[path.path])
        setAddressListPathName(path.name)
        setAddressListPath(path.path)
        setAddressListLoading(true)
        setAddressList([])

        setTimeout(async () => {
            setAddressList(await getAddressList(
                path.path,
                addressListPos
            ))
            setShowAddressList(true)
            setAddressListLoading(false)
        }, 10)
    }

    function next10Address() {
        const path = activePath
        const newPosCache = [...posCache]
        if (newPosCache[path.path] === undefined) {
            newPosCache[path.path] = 0
        }
        newPosCache[path.path] += 10
        setPosCache(newPosCache)
        setAddressListPos(newPosCache[path.path])
        setAddressListLoading(true)
        setAddressList([])

        setTimeout(async () => {
            setAddressList(await getAddressList(
                path.path,
                addressListPos
            ))
            setAddressListLoading(false)
        }, 10)
    }

    function prev10Address() {
        const path = activePath
        const newPosCache = [...posCache]
        if (newPosCache[path.path] === undefined) {
            newPosCache[path.path] = 0
        }
        newPosCache[path.path] = Math.max(posCache[path.path] - 10, 0)
        setPosCache(newPosCache)
        setAddressListPos(newPosCache[path.path])
        setAddressListLoading(true)
        setAddressList([])

        setTimeout(async () => {
            setAddressList(await getAddressList(
                path.path,
                addressListPos
            ))
            setAddressListLoading(false)
        }, 10)
    }

    async function getAddressList(path, start) {
        let newHdNodeCache = { ...hdNodeCache }

        if (newHdNodeCache[path] === undefined) {
          try {
            newHdNodeCache[path] = await webWallet.restoreHdNodeFromLedgerPath(
              ledger,
              path
            )
          } catch (e) {
            alert(`${e.message}
  
${t('ledger.comm_fail')}`)
            return []
          }
        }

        setHdNodeCache(newHdNodeCache)

        const newWalletCache = { ...walletCache }
        const hdNode = newHdNodeCache[path]

        if (newWalletCache[path] === undefined) {
            newWalletCache[path] = {}
        }
        if (newWalletCache[path][start] === undefined) {
          webWallet.restoreFromHdNodeByPage(hdNode, start).forEach(item => {
            newWalletCache[path][item.path] = item
          })
        }
        setWalletCache(newWalletCache)
        
        const returnList = []
        for (let i = start; i < start + 10; i++) {
          returnList[returnList.length] = newWalletCache[path][i]
        }
        return returnList
    }

    function setWallet(wallet, index) {
        wallet.extend.ledger.path += '/' + index
        handleSetWallet(wallet)
      }
}

export default withNamespaces()(DerivePath)