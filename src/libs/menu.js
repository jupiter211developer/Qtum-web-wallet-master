import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SmsIcon from '@mui/icons-material/Sms';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import PhonelinkLockIcon from '@mui/icons-material/PhonelinkLock';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FlipToFrontIcon from '@mui/icons-material/FlipToFront';
import GavelIcon from '@mui/icons-material/Gavel';

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ListIcon from '@mui/icons-material/List';
import SecurityIcon from '@mui/icons-material/Security';
import RepeatIcon from '@mui/icons-material/Repeat';
import UndoIcon from '@mui/icons-material/Undo';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

import CopyrightIcon from '@mui/icons-material/Copyright';
import CreateIcon from '@mui/icons-material/Create';
import PublishIcon from '@mui/icons-material/Publish';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import FingerprintIcon from '@mui/icons-material/Fingerprint';

import SettingsIcon from '@mui/icons-material/Settings';

const items = [
    {
      icon: (<AddIcon fontSize="large" />),
      name: 'create'
    },
    {
      icon: (<AssignmentIcon fontSize="large" />),
      name: 'create_from_mnemonic'
    },
    {
      icon: (<SmsIcon fontSize="small" />),
      name: 'restore_from_mnemonic'
    },
    {
      icon: (<VpnKeyIcon fontSize="small" />),
      name: 'restore_from_wif'
    },
    {
      icon: (<PhonelinkLockIcon fontSize="small" />),
      name: 'restore_from_mobile'
    },
    {
      icon: (<CloudUploadIcon fontSize="small" />),
      name: 'restore_from_key_file'
    },
    {
      icon: (<FlipToFrontIcon fontSize="small" />),
      name: 'restore_from_ledger'
    },
  
    { divider: true, name: 'stake' },
  
    {
      icon: (<GavelIcon fontSize="small" />),
      name: 'delegation'
    },
  
    { divider: true, name: 'wallet' },
  
    {
      icon: (<AccountBalanceWalletIcon fontSize="small" />),
      name: 'view'
    },
    {
      icon: (<ListIcon fontSize="small" />),
      name: 'transactions'
    },
    {
      icon: (<SecurityIcon fontSize="small" />),
      name: 'safe_send'
    },
    {
      icon: (<RepeatIcon fontSize="small" />),
      name: 'send'
    },
    {
      icon: (<UndoIcon fontSize="small" />),
      name: 'request_payment'
    },
    {
      icon: (<CloudDownloadIcon fontSize="small" />),
      name: 'dump_as_key_file'
    },
  
    { divider: true, name: 'contract' },
  
    {
      icon: (<CopyrightIcon fontSize="small" />),
      name: 'create_token'
    },
    {
      icon: (<CreateIcon fontSize="small" />),
      name: 'create_contract'
    },
    {
      icon: (<PublishIcon fontSize="small" />),
      name: 'send_to_contract'
    },
    {
      icon: (<PlayCircleFilledIcon fontSize="small" />),
      name: 'call_contract'
    },
    {
      icon: (<FingerprintIcon fontSize="small" />),
      name: 'create_NFT'
    },
  
    { divider: true, name: 'disc' },
  
    {
      icon: (<SettingsIcon fontSize="small" />),
      name: 'settings'
    },
  ];
  
  export default items