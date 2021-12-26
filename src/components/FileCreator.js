import { withNamespaces } from 'react-i18next';
import { Button } from '@mui/material';

function FileCreator(props) {
    const { t, color, download, href, handleClick } = props

    return (
        <div>
            <Button color={color} variant="contained" onClick={onDownload}>{ t('file_creator.download') }</Button>
        </div>
    )

    function downloadName() {
        return download || (new Date()).getTime()
    }

    function onDownload() {
        const link = document.createElement("a")
        link.download = downloadName()
        link.href = href
        link.click()
        doneClick()
    }

    function doneClick() {
        handleClick()
    }
}

export default withNamespaces()(FileCreator)