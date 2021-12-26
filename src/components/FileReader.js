import { withNamespaces } from 'react-i18next';
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useRef } from 'react'

const Input = styled('input')({
    display: 'none',
});

function FileReaderComp(props) {
    const { t, color, handleUpload } = props
    const uploadRef = useRef()

    return (
        <label htmlFor="contained-button-file">
            <Input id="contained-button-file" type="file" ref={uploadRef} onChange={handleFiles}/>
            <Button variant="contained" color={color} component="span" onClick={clickBtn}>
                { t('file_reader.upload') }
            </Button>
        </label>
    )
    
    function clickBtn() {
        // uploadRef.click()
    }

    function handleFiles(e) {
        const file = e.target.files[0]
        const reader = new FileReader()

        reader.onload = function() {
            handleUpload({ content: this.result })
        }
        reader.readAsText(file)
    }
}

export default withNamespaces()(FileReaderComp)