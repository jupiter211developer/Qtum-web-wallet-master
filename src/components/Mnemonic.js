import { withNamespaces } from 'react-i18next';
import { Button, CardActions, CardContent, Grid, Paper, TextField } from '@mui/material';
import { experimentalStyled as styled } from '@mui/material/styles';
import { useState } from 'react';

const length = 12
const initialArray = ['', '', '', '', '', '', '', '', '', '', '', '']

function Mnemonic(props) {
    const { t, handleMnemonic } = props

    const [currentIndex, setCurrentIndex] = useState(0)
    const [mnemonic, setMnemonic] = useState(initialArray)

    return (
        <div>
            <p>{ t('mnemonic.input_words') }</p>
            <CardContent>
                <Grid container spacing={1}>
                    {Array.from(Array(12)).map((_, index) => (
                        <Grid item xs={2} key={index}>
                            <TextField variant="filled" type="text" value={mnemonic[index]} label={t('mnemonic.label') + (index+1)} 
                                onKeyPress={(ev) => {
                                    if (ev.key == 'Enter') {
                                        tryInputMnemonicWords()
                                    }
                                }}
                                onChange={(ev) => {
                                    const newMnemonic = [...mnemonic]
                                    newMnemonic[index] = ev.target.value
                                    setMnemonic(newMnemonic)
                                }}></TextField>
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
            <CardActions>
                <Grid container justifyContent="flex-end" direction="row">
                    <Button color="success" variant="contained" onClick={inputMnemonicWords} disabled={notFinishInput()}>{ t('common.confirm') }</Button>
                </Grid>
            </CardActions>
        </div>
    )

    function notFinishInput() {
        return mnemonic.filter((word) => !!word).length !== length
    }

    function inputMnemonicWords() {
        handleMnemonic(mnemonic.join(' '))
    }

    function tryInputMnemonicWords() {
        if (notFinishInput) {
            if (mnemonic[currentIndex]) {
                // this.$refs.mnemonicInput[this.currentIndex + 1].focus()
            }
            return
        }

        inputMnemonicWords()
    }

    function focus(index) {
        setCurrentIndex(index)
    }
}

export default withNamespaces()(Mnemonic)