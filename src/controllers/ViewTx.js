import { withNamespaces } from 'react-i18next';
import { Button, CardContent, CardHeader, Grid, Chip, Card } from '@mui/material';
import { useEffect, useState } from 'react';
import webWallet from '../libs/web-wallet';
import Wallet from '../libs/wallet';
import server from '../libs/server';

function ViewTx(props) {
    const { t, view } = props

    const [wallet, setWallet] = useState(webWallet.getWallet())
    const [node, setNode] = useState(server.currentNode())

    useEffect(() => {
        wallet.setTxList()
    }, [view])

    useEffect(() => {
        wallet.update()
    }, [])

    return (
        <Card>
            <CardHeader title={t('view_tx.title')}>
            </CardHeader>
            <CardContent>
                <p>{ t('view_tx.recent') }</p>
                {
                    txList().map((tx, id) => 
                        <div key={id}>
                            <Grid container sx={{ borderBottom: '1px dashed' }}>
                                <Grid item xs={10}>
                                    { t('view_tx.tx') }
                                    <Button size="small" href={node.getTxExplorerUrl(tx.id)} target="_blank">{tx.id}</Button>
                                </Grid>
                                <Grid item xs={2}>
                                    { t('view_tx.mined_at') }{ new Date(tx.timestamp * 1000).toString() }
                                </Grid>
                            </Grid>
                            <Grid container sx={{ borderBottom: '1px dashed' }}>
                                <Grid item xs={3}>
                                    {
                                        tx.inputs.map((vtx, vid) => 
                                            <p
                                                key={vid}
                                                className={vtx.address === wallet.info.address ? 'red--text' : ''}
                                                style={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                                >
                                               { vtx.address }
                                            </p>
                                        )
                                    }
                                </Grid>
                                <Grid item xs={1} sx={{ textAlign: 'right' }}>
                                    {
                                        tx.inputs.map((vtx, vid) => 
                                            <p key={vid} className={vtx.address === wallet.info.address ? 'red--text' : ''}>
                                                { Wallet.changeUnitFromSatTo1(vtx.value) }
                                            </p>
                                        )
                                    }
                                </Grid>
                                <Grid item xs={1}>
                                    {
                                        tx.inputs.map((vtx, vid) => 
                                            <p key={vid} className={vtx.address === wallet.info.address ? 'red--text' : ''}>
                                                &nbsp;QTUM
                                            </p>
                                        )
                                    }
                                </Grid>
                                <Grid item xs={1}>
                                    =&gt; 
                                </Grid>
                                <Grid item xs={3}>
                                    {
                                        tx.outputs.map((vtx, vid) => 
                                            <p key={vid} className={vtx.address === wallet.info.address ? 'green--text' : ''}
                                                style={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                { vtx.address && <>{vtx.address}</> }
                                            </p>
                                        )
                                    }
                                </Grid>
                                <Grid item xs={2} sx={{ textAlign: 'right' }}>
                                    {
                                        tx.outputs.map((vtx, vid) => 
                                            <p key={vid} className={vtx.address === wallet.info.address ? 'green--text' : ''}>
                                                { vtx.address && <>{Wallet.changeUnitFromSatTo1(vtx.value)}</> }
                                            </p>
                                        )
                                    }
                                </Grid>
                                <Grid item xs={1}>
                                    {
                                        tx.outputs.map((vtx, vid) => 
                                            <p key={vid} className={vtx.address === wallet.info.address ? 'green--text' : ''}>
                                                { vtx.address && <>QTUM</> }
                                            </p>
                                        )
                                    }
                                </Grid>
                            </Grid>
                            <Grid container sx={{ borderBottom: '1px dashed' }}>
                                <Grid item xs={4}>
                                    <Chip label={ t('view_tx.total_in') + Wallet.changeUnitFromSatTo1(tx.inputValue) } sx={{ color: 'white', backgroundColor: '#606060', margin: '3px 5px', borderRadius: '2px' }} />
                                </Grid>
                                <Grid item xs={4}>
                                    <Chip label={ t('view_tx.fee') + Wallet.changeUnitFromSatTo1(tx.fees) } sx={{ color: 'white', backgroundColor: '#606060', margin: '3px 5px', borderRadius: '2px' }} />
                                </Grid>
                                <Grid item xs={4}>
                                    <Chip label={ t('view_tx.total_out') + Wallet.changeUnitFromSatTo1(tx.outputValue) } sx={{ color: 'white', backgroundColor: '#606060', margin: '3px 5px', borderRadius: '2px' }} />
                                </Grid>
                            </Grid>
                        </div>
                    )
                }
            </CardContent>
        </Card>
    )

    function txList() {
        return wallet.txList
    }
}

export default withNamespaces()(ViewTx)