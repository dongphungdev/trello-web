import Box from '@mui/material/Box'
import Column from './Column/Column'
import Button from '@mui/material/Button'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'

function ListColumns({ columns }) {
  /**
   * Thằng sortableContext yêu cầu Items là một dạng mảng['id-1','id-2'] chứ không phải dạng [{id:'id-1'},
   {id:'id-2'}]
   * Nếu không đúng thì vân kéo thả được nhưng không có animation
   * tài liệu có trên: https://github.com/clauderic/dnd-kit/issues/183#issuecomment-812569512
   */
  return (
    <SortableContext items={columns?.map(c => c._id)} strategy={horizontalListSortingStrategy}>
      <Box sx={{
        bgcolor:'inherit',
        width:'100%',
        height:'100%',
        display:'flex',
        overflowX:'auto',
        overflowY:'hidden'
        // '&::-webkit-screenbar-track':{
        //   m:2
        // }
      }}>
        {columns?.map(column => (<Column key= {column._id} column={column} />) //thay ngoặc kép bằng ngoặc tròn thì không cần return
        )}
        {/* box add new column */}
        <Box sx={{
          minWidth:'200px',
          mx:'2px',
          maxWidth:'200px',
          borderRadius:'6px',
          height:'fit-content',
          bgcolor:'#ffffff3d'
        }}>
          <Button startIcon = {<NoteAddIcon/>} sx={{
            color:'white',
            width:'100%',
            justifyContent:'flex-start',
            pl:2.5,
            py:1
          }}>Add New Column</Button>
        </Box>
      </Box>
    </SortableContext>
  )
}
export default ListColumns