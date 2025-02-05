import Card from './Card/Card'
import Box from '@mui/material/Box'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'


function ListCard({ cards }) {
  return (
    <SortableContext items={cards?.map(c => c._id)} strategy={verticalListSortingStrategy}>
      <Box sx = {{
        p:'0 5px',
        m:'0 5px',
        display:'flex',
        flexDirection:'column',
        gap:1,
        overflowX:'hidden',
        overflowY:'auto',
        maxHeight: (theme) => `calc(
        ${theme.trello.boardContentHeight} - ${theme.spacing(5)} - ${theme.trello.columnHeaderHeight} - ${theme.trello.columnFooterHeight})`,
        '&::-webkit-screenbar-thumb':{
          backgroundColor:'#bdc3c7',
          borderRadius:'8px'
        },
        '&::-webkit-screenbar-thumb:hover':{
          backgroundColor:'#00b894',
          borderRadius:'8px'
        }
      }}>
        {cards?.map(card => <Card key={card._id} card ={card} />)}
      </Box>
    </SortableContext>
  )
}

export default ListCard