import React from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import ContentCut from '@mui/icons-material/ContentCut'
import ContentCopy from '@mui/icons-material/ContentCopy'
import ContentPaste from '@mui/icons-material/ContentPaste'
import Cloud from '@mui/icons-material/Cloud'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Tooltip from '@mui/material/Tooltip'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import AddCardIcon from '@mui/icons-material/AddCard'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import ListCard from './ListCards/ListCard'
import { mapOrder } from '~/utils/sorts'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function Column({ column }) {
  //sort kéo thả
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column._id,
    data:{ ...column }
  })

  const dndKtColumnStyles = {
    // touchAction:'none', //Dành cho sensor default dạng PionterSensor
    // Nếu sử dụng Css.Transfrom như docs sẽ lỗi kiểu stretch(kéo dài)
    // Tài liệu: https: //github.com/clauderic/dnd-kit/issues/117
    transform: CSS.Translate.toString(transform),
    transition,
    /* Chiều cao phải luôn max 100% vì nếu không sẽ lỗi kéo thả column ngắn qua một cái column dài
    thì phải kéo ở khu vực giữa rất khó chịu. Lưu ý đoạn này phải kết hợp với {...listener} nằm ở
    Box chứ không phải nằm ở div ngoài cùng để tránh trường hợp kéo vào vùng xanh column */
    height:'100%',
    opacity: isDragging ? 0.5 : undefined
  }
  //  dropdow menu
  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  // sắp xếp cho card
  const orderedCards = mapOrder(column?.cards, column?.cardOrderIds, '_id')

  return (
    // Phải div ở đây vì vấn đề chiều cao của column khi kéo thả sẽ có bug kiểu flickering
    <div ref={setNodeRef} style={dndKtColumnStyles} {...attributes}>
      <Box
        {...listeners} // listeners lắng nghe các even sự kiện
        sx={{
          minWidth:'300px',
          minHeight:'300px',
          maxWidth:'300px',
          bgcolor: (theme) => (theme.palette.mode === 'dark'? '#333643' :'#ebecf0'),
          ml:2,
          borderRadius:'6px',
          height:'fit-content',
          maxHeight: (theme) => `calc(${theme.trello.boardContentHeight} - ${theme.spacing(5)}})`
        }}
      >
        {/* box header */}
        <Box sx = {{
          height: (theme) => theme.trello.columnHeaderHeight,
          p:2,
          display:'flex',
          alignItems:'center,',
          justifyContent:'space-between'
        }}>
          <Typography sx={{
            fontWeight:'bold',
            cursor:'pointer'
          }}>
            {column?.title}
          </Typography>
          {/* menu column */}
          <Box>
            <Tooltip title="More options">
              <ExpandMoreIcon sx={{ color:'text.primary', cursor:'pointer' }}
                id="basic-column-dropdown"
                aria-controls={open ? 'basic-menu-column' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
              />
            </Tooltip>
            <Menu
              id="basic-menu-column"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-column-dropdown'
              }}
            >
              <MenuItem>
                <ListItemIcon><AddCardIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Add new Card</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon><ContentCut fontSize="small" /></ListItemIcon>
                <ListItemText>Cut</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon><ContentCopy fontSize="small" /></ListItemIcon>
                <ListItemText>Copy</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon><ContentPaste fontSize="small" /></ListItemIcon>
                <ListItemText>Paste</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem>
                <ListItemIcon><DeleteForeverIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Remove this column</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon><Cloud fontSize="small" /></ListItemIcon>
                <ListItemText>Archive this column</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        {/* List Cards*/}
        <ListCard cards ={orderedCards}/>
        {/* box footer */}
        <Box sx = {{
          height:(theme) => theme.trello.columnFooterHeight,
          p:2,
          display:'flex',
          alignItems:'center,',
          justifyContent:'space-between'
        }}>
          <Button startIcon={<AddCardIcon/>}>Add new card</Button>
          <Tooltip title="Drag to move">
            <DragHandleIcon sx={{ cursor:'pointer' }}></DragHandleIcon>
          </Tooltip>
        </Box>
      </Box>
    </div>
  )
}

export default Column