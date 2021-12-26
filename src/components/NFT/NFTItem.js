import { withNamespaces } from 'react-i18next';
import { Card, Dialog, Grid } from '@mui/material';
import { useState, useEffect } from 'react';
import '../../assets/less/nft-item.less'

function NFTItem(props) {
    const { t, isOpen, curImg, handleClose } = props
    
    const [isShowClose, setIsShowClose] = useState(false)

    useEffect(() => {
        setTimeout(() => {
            setIsShowClose(true)
        }, 400)
    })

    return (
        <Grid container justifyContent="center" alignItems="center">
            <Dialog open={isOpen} onClose={handleClose}>
                <Card sx={{ width: '1000px' }}>
                <div className="nft-item__detail">
                    <img src={curImg} alt="img" />
                </div>
                </Card>
                {
                    isShowClose && 
                        (<div
                            className="nft-item__dialog--close-wrapper"
                            onClick={handleClose}
                        >
                            <div class="nft-item__dialog--close">×</div>
                        </div>)
                }
            </Dialog>
        </Grid>
    )
}

export default withNamespaces()(NFTItem)