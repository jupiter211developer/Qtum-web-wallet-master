import { withNamespaces } from 'react-i18next';
import { CardContent, CardHeader, Card, Button, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { useEffect, useState } from 'react';
import webWallet from '../libs/web-wallet'
import track from '../libs/track'
import config from '../libs/config'
import Mnemonic from '../components/Mnemonic';

const headers = [
    { text: 'Address', value: 'address', align: 'left', sortable: false },
    { text: 'Balance', value: 'balance', sortable: false },
    { text: '', value: '', sortable: false }
]

function RestoreMobile(props) {
    const { t, handleRestored } = props
    
    const [walletList, setWalletList] = useState([])
    const [restored, setRestored] = useState(false)

    return (
        <Card>
            <CardHeader title={ t('restore_mobile.title') }></CardHeader>
            <CardContent>
                { restored === false && <Mnemonic handleMnemonic={restore}></Mnemonic> }
                {  (
                    restored && <Table sx={{ minWidth: 650, backgroundColor: '#424242', color: 'white !important' }} aria-label="simple table">
                        <TableHead sx={{ backgroundColor: '#424242', color: 'white' }}>
                            <TableRow>
                                <TableCell align="left" sx={{ color: 'white !important' }}>Address</TableCell>
                                <TableCell sx={{ color: 'white !important' }}>Balance</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody sx={{ color: 'white' }}>
                            {walletList.map((item) => (
                                <TableRow
                                    key={item.wallet.getAddress()}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, color: 'white' }}
                                >
                                    <TableCell align="left" sx={{ color: 'white', paddingTop: '3px', paddingBottom: '3px' }}>{item.wallet.getAddress()}</TableCell>
                                    <TableCell align="right" sx={{ color: 'white', paddingTop: '3px', paddingBottom: '3px' }}>{item.wallet.info.balance}</TableCell>
                                    <TableCell align="right" sx={{ paddingTop: '3px', paddingBottom: '3px' }}>
                                        <Button variant="contained" color="success" onClick={() => choose(item.path)}>Choose</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) }
            </CardContent>
        </Card>
    )

    function restore(mnemonic) {
        setRestored(true)
        const result = webWallet.restoreFromMobile(mnemonic)
        setWalletList(result)
        track.trackStep('restore_from_mobile', 1, 2)
    }

    function choose(path) {
        webWallet.chooseMobileWallet(walletList, path)
        track.trackDone('restore_from_mobile')
        handleRestored()
    }
}

export default withNamespaces()(RestoreMobile)