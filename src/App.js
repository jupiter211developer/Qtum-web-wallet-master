import './App.css';
import { useState, useEffect } from 'react'
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme'
import { CssBaseline, Drawer, Box, Divider, AppBar, Toolbar, Typography, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

import { NavItem } from './components/NavItem'
import './i18n'
import { withNamespaces } from 'react-i18next';

import config from './libs/config'
import webWallet from './libs/web-wallet'
import track from './libs/track'
import items from './libs/menu'
import qtumInfo from './libs/nodes/qtumInfo'

import CreateWallet from './controllers/CreateWallet';
import CreateMnemonic from './controllers/CreateMnemonic'
import RestoreWallet from './controllers/RestoreWallet';
import RestoreWif from './controllers/RestoreWif';
import RestoreMobile from './controllers/RestoreMobile';
import RestoreKeyFile from './controllers/RestoreKeyFile';
import RestoreLedger from './controllers/RestoreLedger';
import ViewWallet from './controllers/ViewWallet';
import ViewTx from './controllers/ViewTx';
import SafeSend from './controllers/SafeSend';
import Send from './controllers/Send';
import RequestPayment from './controllers/RequestPayment';
import DumpKeyFile from './controllers/DumpKeyFile';
import CreateToken from './controllers/CreateToken';
import CreateContract from './controllers/CreateContract';
import SendToContract from './controllers/SendToContract';
import CallContract from './controllers/CallContract';
import CreateNFT from './controllers/CreateNFT';
import Delegation from './controllers/Delegation';
import Config from './controllers/Config';

const MainContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flex: '1 1 auto',
  maxWidth: '100%',
  minHeight: '100vh',
  paddingTop: 64,
  backgroundColor: '#303030',
  [theme.breakpoints.up('lg')]: {
    paddingLeft: 300
  }
}))

function App({t}) {
  const [current, setCurrent] = useState('create')
  const [wallet, setWalletData] = useState(false)
  const [network, setNetwork] = useState(config.getNetwork())
  const [mode, setMode] = useState(config.getMode())
  const [notifyList, setNotifyList] = useState({})
  const [delegationShow, setDelegationShow] = useState(false)

  useEffect(() => {
    track.track('lan', config.getLan())
    onlineDelegation(network)
  }, [])

  function notShow() {
    return {
      restore_from_ledger: network !== 'mainnet',
      view: mode === 'offline' || !wallet,
      transactions: mode === 'offline' || !wallet,
      wallet: mode === 'offline' && !wallet,
      safe_send: mode === 'offline' && !wallet,
      send: mode === 'offline' || !wallet,
      request_payment: !wallet,
      dump_as_key_file: !wallet || !wallet.getHasPrivKey(),
      contract: mode === 'offline' || !wallet,
      create_token: mode === 'offline' || !wallet,
      create_contract: mode === 'offline' || !wallet,
      send_to_contract: mode === 'offline' || !wallet,
      call_contract: mode === 'offline' || !wallet,
      create_NFT: mode === 'offline' || !wallet,
      stake: mode === 'offline' || !wallet,
      delegation: mode === 'offline' || !wallet || !delegationShow
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MainContainer>
        <Box
          sx={{
            display: 'flex',
            flex: '1 1 auto',
            flexDirection: 'column',
            width: '100%',
            paddingTop: '30px'
          }}
        >
          <Grid container spacing={4} direction="row"
            justifyContent="center"
            alignItems="center">
            <Grid item xs={10}>
              {
                current == 'create' && <CreateWallet handleCreated={setWallet} view={current == 'create'} />
              }
              {
                current == 'create_from_mnemonic' && <CreateMnemonic handleCreated={setWallet} view={current == 'create_from_mnemonic'} />
              }
              {
                current == 'restore_from_mnemonic' && <RestoreWallet handleRestored={setWallet} />
              }
              {
                current == 'restore_from_wif' && <RestoreWif handleRestored={setWallet} />
              }
              {
                current == 'restore_from_mobile' && <RestoreMobile handleRestored={setWallet} />
              }
              {
                current == 'restore_from_key_file' && <RestoreKeyFile handleRestored={setWallet} />
              }
              {
                current == 'restore_from_ledger' && <RestoreLedger handleRestored={setWallet} />
              }
              {
                current == 'view' && <ViewWallet view={current == 'view'}/>
              }
              {
                current == 'transactions' && <ViewTx view={current == 'transactions'}/>
              }
              {
                current == 'safe_send' && <SafeSend handleSend={setWallet}/>
              }
              {
                current == 'send' && <Send handleSend={setWallet}/>
              }
              {
                current == 'request_payment' && <RequestPayment />
              }
              {
                current == 'dump_as_key_file' && <DumpKeyFile />
              }
              {
                current == 'create_token' && <CreateToken />
              }
              {
                current == 'create_contract' && <CreateContract />
              }
              {
                current == 'send_to_contract' && <SendToContract />
              }
              {
                current == 'call_contract' && <CallContract />
              }
              {
                current == 'create_NFT' && <CreateNFT />
              }
              {
                current == 'delegation' && <Delegation />
              }
              {
                current == 'settings' && <Config />
              }
            </Grid>
          </Grid>
        </Box>
      </MainContainer>
      <AppBar>
        <Toolbar>
          <i className="qtum-icon qtum-icon-logo"></i>
          <Typography variant="h6" component="div">
              QTUM --Fastlane-Mainnet
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open
        PaperProps={{
          sx: {
            backgroundColor: 'neutral.900',
            color: '#FFFFFF',
            width: 300,
            // top: '64px',
            maxHeight: 'calc(100% - 64px)',
            marginTop: '64px'
          }
        }}
        variant="permanent"
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}
          >
          <Box sx={{
            flexGrow: 1,
            marginTop: '10px'
          }}>
            {items.map((item) => (
              item.divider ? 
                (!notShow()[item.name] ? (<Divider key={item.name} sx={{ borderColor: '#2D3748' }} />) : null) 
                  :
                (!notShow()[item.name] ? (<NavItem
                  key={item.name}
                  icon={item.icon}
                  href={item.href}
                  active={current == item.name}
                  setActive={() => changeView(item.name)}
                  title={t('common.menu.' + item.name)}
                  sx={{
                    paddingLeft: '0px',
                    paddingRight: '0px',
                    paddingTop: '3px',
                    paddingBottom: '3px'
                  }}
                />) : null)
            ))}
          </Box>
        </Box>
      </Drawer>
    </ThemeProvider>
  );

  function changeView(name) {
    setCurrent(name)
    track.trackAction('change', 'page', name)
  }

  async function onlineDelegation(network) {
    // 判断代理挖矿功能是否上线
    if (localStorage.getItem(`${network}_delegation_online`)) {
      setDelegationShow(true)
    } else {
      let height = 0
      switch (network) {
        case 'testnet':
          height = 625000
          break
        case 'mainnet':
          height = 680000
          break
      }
      // 请求高度
      const res = await qtumInfo.getQtumInfo()
      if (res.height > height) {
        localStorage.setItem(`${network}_delegation_online`, true)
        setDelegationShow(true)
      }
    }
  }

  function setWallet() {
    const wallet1 = webWallet.getWallet()
    setWalletData(wallet1)
    wallet1.init()
    if (wallet1) {
      if (mode == 'offline') {
        setCurrent('request_payment')
      } else {
        setCurrent('view')
      }
    }
  }
}

export default withNamespaces()(App);
