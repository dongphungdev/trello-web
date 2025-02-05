import Box from '@mui/material/Box'
import ModeSelect from '~/components/ModeSelect/ModeSelect'
import AppsIcon from '@mui/icons-material/Apps'
import { ReactComponent as trelloLogo } from '~/assets/trello.svg'
import SvgIcon from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'
import Workspaces from './Menus/Workspaces'
import Recent from './Menus/Recent'
import Starred from './Menus/Starred'
import Templates from './Menus/Templates'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import Badge from '@mui/material/Badge'
import Tooltip from '@mui/material/Tooltip'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import Profiles from './Menus/Profiles'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'

function AppBar() {
  return (
    <Box sx={{
      width:'100%',
      height:(theme) => theme.trello.appBarHeight,
      display:'flex',
      alignItems:'center',
      justifyContent:'space-between',
      paddingX:'2px',
      gap: 2,
      overflowY:'hidden',
      overflowX:'auto'
    }}>
      <Box sx={{ display:'flex', alignItems:'center', gap:2 }}>
        <AppsIcon sx={{ color:'primary.main' }} />
        <Box sx={{ display:'flex', alignItems:'center', gap:0.5 }}>
          <SvgIcon component={trelloLogo} fontSize="small" sx={{ color:'primary.main' }} inheritViewBox /*inheritViewBox kế thừa cái Viewbox trong trello.svg*//>
          <Typography variant="span" sx={{ fontSize:'1.2rem', fontWeight:'bold', color:'primary.main' }} >Trello</Typography>
        </Box>
        <Box sx= {{
          display:{ sx:'none', md:'flex' }, gap: 1
        }}>
          <Workspaces/>
          <Recent/>
          <Starred/>
          <Templates/>
          <Button variant="outlined"startIcon={<LibraryAddIcon/>}>Create</Button>

        </Box>
      </Box>
      <Box sx={{ display:'flex', alignItems:'center', gap:2, color:'primary.main', fontSize:'0.875rem' }}>
        <TextField id="outlined-search" label="Search..." type="search" size='small' sx={{ minWidth:'120px' }} />
        < ModeSelect />
        <Tooltip title="Notification">
          <Badge color="secondary" variant="dot" sx={{ cursor:'pointer' }}>
            <NotificationsNoneIcon />
          </Badge>
        </Tooltip>
        <Tooltip title="help" sx={{ cursor:'pointer' }}>
          <HelpOutlineIcon/>
        </Tooltip>
        <Profiles/>
      </Box>
    </Box>
  )
}

export default AppBar