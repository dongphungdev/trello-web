import Button from '@mui/material/Button'
import { Card as MuiCard } from '@mui/material'
import Typography from '@mui/material/Typography'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import GroupIcon from '@mui/icons-material/Group'
import CommentIcon from '@mui/icons-material/Comment'
import AttachmentIcon from '@mui/icons-material/Attachment'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function Card({ card }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card._id,
    data:{ ...card }
  })

  const dndKtCardStyles = {
    // touchAction:'none', //Dành cho sensor default dạng PionterSensor
    // Nếu sử dụng Css.Transfrom như docs sẽ lỗi kiểu stretch(kéo dài)
    // Tài liệu: https: //github.com/clauderic/dnd-kit/issues/117
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    border: isDragging ? '1px solid #1de9b6' : undefined
  }
  const shouldShowCardAction = () => (!!card?.memberIds?.length || !!card?.comments?.length || !!card?.attachments?.length) // nếu tồn tại 1 trong 3 điều kiện trên thì mới được hiển thị
  return (
    <MuiCard
      ref={setNodeRef} style={dndKtCardStyles} {...attributes} {...listeners}
      sx={{
        cursor:'pointer',
        boxShadow:'0 1px 1px rgba(0, 0, 0, 0.2)',
        overflow:'unset'
      }}>
      {card?.cover &&<CardMedia sx={{ height: 140 }} image={card?.cover}/>}
      <CardContent sx={{ p:1.5, '&:last-child':{ p:1.5 } }}>
        <Typography>{card?.title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {/* Thêm nội dung mô tả vào đây */}
        </Typography>
      </CardContent>
      {/* gọi lại hàm shouldShowCardAction nếu tồn tại 1 trong 3 điều kiện trên thì hiênr thị */}
      {shouldShowCardAction() &&
        <CardActions sx={{ p:'0 4px 8px 4px' }}>
          {/* 2 lần dấu !! là phủ định của phủ định */}
          {!!card?.memberIds?.length && <Button size="small" startIcon={<GroupIcon/>}>{card?.memberIds?.length}</Button> }
          {!!card?.comments?.length && <Button size="small" startIcon={<CommentIcon/>}>{card?.comments?.length}</Button> }
          {!!card?.attachments?.length && <Button size="small" startIcon={<AttachmentIcon/>}>{card?.attachments?.length}</Button> }
        </CardActions>
      }
    </MuiCard>
  )
}

export default Card