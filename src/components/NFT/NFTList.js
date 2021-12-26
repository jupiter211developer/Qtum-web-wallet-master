import { withNamespaces } from 'react-i18next';
import { Button, Card, CardHeader, Grid, Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import webWallet from '../../libs/web-wallet'
import { nftService } from '../../libs/nft'
import '../../assets/less/nft-list.less'
import NFTSend from './NFTSend';
import NFTItem from './NFTItem';

const NFT_LOADCOUNT = 1000

function NFTListComp(props) {
    const { t } = props
    
    const [isOpenSendDialog, setIsOpenSendDialog] = useState(false)
    const [isOpenNFTDialog, setIsOpenNFTDialog] = useState(false)
    const [curCount, setCurCount] = useState(0)
    const [curIndex, setCurIndex] = useState(0)
    const [curTokenId, setCurTokenId] = useState('-1')
    const [curImg, setCurImg] = useState('')
    const [isShowLoadMore, setIsShowLoadMore] = useState(false)
    const [NFTList, setNFTList] = useState([])

    useEffect(async () => {
        await loadNFTList()
    }, [])

    return (
        <Card>
            <CardHeader>{ t('nft.title') }</CardHeader>
            <Grid container>
                <Card className="nft-card">
                    { NFTList.length === 0 && <div className="nft-item__desc">no-data</div> }
                    {
                        NFTList.length > 0 && NFTList.map((nft, i) => (
                            <div className="nft-item" key={nft.NFTId.toString()} onClick={(e) => handleOpenNFTItem(true, nft.url, e)}>
                                <div className="nft-item__count">
                                    <div className="nft-item__count-box">{ nft.count }</div>
                                </div>
                                <Box
                                    component="img"
                                    className="nft-item_img"
                                    sx={{
                                        maxWidth: '100%',
                                        height: 'auto'
                                    }}
                                    src={nft.url}
                                />
                                <div className="nft-item__name">
                                    { nft.name }
                                </div>
                                <div className="nft-item__desc">
                                    <Typography
                                        variant="body1"
                                        style={{whiteSpace: 'pre-line'}}>
                                        { nft.desc }
                                        </Typography>
                                </div>
                                <Button variant="contained" color="info" size="small" onClick={(e) => handleOpen(true, nft.count, nft.tokenId, e)}>
                                    { t('nft.send') }
                                </Button>
                            </div>
                        ))
                    }
                </Card>
                { 
                    isShowLoadMore && (
                        <div className="nft__load-more" onClick={loadNFTList}>
                            load more
                        </div>
                    )
                }
            </Grid>
            <NFTSend
                tokenId={curTokenId}
                isOpen={isOpenSendDialog}
                count={curCount}
                handleClose={() => setIsOpenSendDialog(false)}>
            </NFTSend>
            <NFTItem
                isOpen={isOpenNFTDialog}
                curImg={curImg}
                handleClose={(e) => handleOpenNFTItem(false, ``, e)}>
            </NFTItem>
        </Card>
    )
    
    function handleOpen(val, count, tokenId, e) {
        e && e.stopPropagation()
        setCurCount(count)
        setCurTokenId(tokenId)
        setIsOpenSendDialog(val)
    }

    function handleOpenNFTItem(val, curImg, e) {
        e && e.stopPropagation()
        setCurImg(curImg)
        setIsOpenNFTDialog(val)
    }

    async function loadNFTList() {
        const wallet = webWallet.getWallet()
        const {
            info: { address }
        } = wallet

        if (address) {
            const [NFTList, index] = await nftService.getNFTListByOwner(
                    address,
                    curIndex,
                    NFT_LOADCOUNT
                )
            const newCurIndex = index
            if (newCurIndex === NFT_LOADCOUNT) {
                setIsShowLoadMore(true)
            } else {
                setIsShowLoadMore(false)
            }

            setCurIndex(newCurIndex)

            const newNFTList = [...NFTList]

            newNFTList.concat(
                newNFTList.filter((NFT) => NFT.count > 0)
            )

            setNFTList(newNFTList)
        }
    }
}

export default withNamespaces()(NFTListComp)