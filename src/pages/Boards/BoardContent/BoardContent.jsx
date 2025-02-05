import ListColumns from './ListColumns/ListColumns'
import Box from '@mui/material/Box'
import { mapOrder } from '~/utils/sorts'
import { DndContext,
  /*PointerSensor,*/
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  closestCorners, 
  closestCenter,
  pointerWithin,
  rectIntersection,
  getFirstCollision} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useEffect, useState,useCallback, useRef } from 'react'
import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCards/Card/Card'
import { cloneDeep } from 'lodash'

const ACTIVE_DRAG_ITEM_TYPE ={
  COLUMN:'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD:'ACTIVE_DRAG_ITEM_TYPE_CARD'
}

function BoardContent({ board }) {
  // tài liệu xử lý khi click nhận dữ liệu https://docs.dndkit.com/api-documentation/sensors
  // Nếu dùng pointerSensor mặc định thì phải kết hợp thuộc tính css touch-action:'none' ở những thành phần kéo thả - nhưng vẫn còn bug

  // const pointerSensor = useSensor(PointerSensor, { activationConstraint:{ distance: 10 } })
  // yêu cầu chuột di chuyển 10px thì mới kích hoạt even, fix trường hợp khi click bị gọi even
  const mouseSensor = useSensor(MouseSensor, { activationConstraint:{ distance: 10 } })
  // Nhấn giữ 250ms và dung sai của cảm ứng 500px thì mới kích hoạt even
  const touchSensor = useSensor(TouchSensor, { activationConstraint:{ delay:250, tolerance:500 } })

  // Ưu tiên kết hợp 2 loại sensors là mouse và touch để có trải nghiệm mobile tốt nhất, không bị bug.
  // const mySensors = useSensors(pointerSensor)
  const mySensors = useSensors(mouseSensor, touchSensor)


  const [orderedColumnsState, setOrderedColumnsState] = useState([])

  //Cùng 1 thời điểm chỉ có 1 phần tử đang được kéo thả ( column or card)
  const [activeDragItemId, setActiveDragItemId] = useState([null])
  const [activeDragItemType, setActiveDragItemType] = useState([null])
  const [activeDragItemData, setActiveDragItemData] = useState([null])
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] = useState([null])

  //Điểm va chạm cuối cùng trước đó
  const lastOverId = useRef(null)
  useEffect(() => {
    const orderedColumns = mapOrder(board?.columns, board?.columnOrderIds, '_id')
    setOrderedColumnsState(orderedColumns)
  }, [board]) //mỗi khi board thay đổi thì useEffect sẽ được gọi lại
  // Tìm một cái Column theo CardId
  const findColumnByCardId = (cardId) => {
    /* Đoạn này cần lưu ý, nên dùng c.cards thay vì dùng c.cardOrderIds bởi vì ở bước handleDragOver chúng ta
     sẽ làm dữ liệu cho cards hoàn chỉnh trước rồi mới tạo ra cardOrderIds mới. */
    return orderedColumnsState.find(column => column?.cards?.map(card => card._id)?. includes(cardId))
  }

  // Function chung xử lý việc cập nhật lại state trong trường hợp di chuyển Card giữa các Column khác nhau
  const moveCardBetweenDifferentColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData
  ) => {
    setOrderedColumnsState(prevColumns => {
      //Tìm vị trí (index) của cái overCard trong column đích ( nơi mà activeCard sắp được thả)
      const overCardIndex = overColumn?.cards?.findIndex(card => card._id === overCardId)
      // logic tinh toán "cardIdnex mới"( trên hoặc dưới của overCard) lấy chuẩn code từ thư viện
      let newCardIndex
      const isBelowOverItem = active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height
      const modifier = isBelowOverItem ? 1 : 0
      newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.cards?.length + 1

      // Clone mảng OderedColumnsState cũ ra một cái mới để xử lý data rồi return - cập nhật lại OrderedColumnsState mới
      const nextColumns = cloneDeep(prevColumns)
      const nextActiveColumn = nextColumns.find(column => column._id === activeColumn._id)
      const nextOverColumn = nextColumns.find(column => column._id === overColumn._id)

      // Column cũ
      if (nextActiveColumn) {
        // Xóa card ở cái column active (cũng có thể ở column cũ, cái lúc mà kéo card ra khỏi nó để sang column khác )
        nextActiveColumn.cards = nextActiveColumn.cards.filter(card => card._id !== activeDraggingCardId)
        // cập nhật lại mảng carOrderIds cho chuẩn dữ liệu
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(card => card._id)
      }
      //Column mới
      if (nextOverColumn) {
        // kiểm tra xem card đang kéo nó có tồn tại ở overColumn chưa, nếu có thì cần xóa nó trước
        nextOverColumn.cards = nextOverColumn.cards.filter(card => card._id !== activeDraggingCardId)
        // Đối với trường hợp dragEnd thì phải cập nhật lại chuẩn dữ liệu columnId trong card sau khi kéo card giữa 2 column khác nhau
        const rebuild_activeDraggingCardData = {
          ...activeDraggingCardData,
          columnId: nextOverColumn._id
        }
        // Tiếp theo là thêm cái card đang kéo vào overColumn theo vị trí index mới
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(newCardIndex, 0, rebuild_activeDraggingCardData)
        // cập nhật lại mảng carOrderIds cho chuẩn dữ liệu
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(card => card._id)
      }
      // console.log('nextColumns:', nextColumns )
      return nextColumns
    })
  }
  //  Trigger Khi bắt đầu kéo (drag) 1 phần tử
  const handleDragStart = (event) => {
    // console.log('handleDragStart', event)

    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD :
      ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    setActiveDragItemData (event?.active?.data?.current)
    // Nếu kéo card thì mới thực hiện hành động set giá trị cho oldColumn
    if (event?.active?.data?.current?.columnId) {
      setOldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id))
    }
  }

  // TRigger trong quá trình kéo (Drag) một phần tử
  const handleDragOver = (event) => {
    // không làm gì cả nếu đang kéo column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return
    //Còn nếu kéo Card thì xử lý thêm vấn đè kéo thả Card qua lại giữa các Columns
    // console.log ('handleDragOver', event )
    const { active, over } = event

    // Cần đảm bảo nếu không tồn tại active hoặc over ( khi kéo thả ra khỏ phạm vi contaner) thì không làm gì (tránh crash trang)
    if (!active || !over) return
    // activeDraggingCard: Là Card đang được kéo
    const { id: activeDraggingCardId, data: { current:activeDraggingCardData } } = active

    // overCard: Là Card đang tương tác trên hoặc dưới so với cái Card đang được kéo ở trên
    const { id: overCardId } = over

    //  Tìm 2 cái Column theo CardID
    const activeColumn = findColumnByCardId(activeDraggingCardId)
    const overColumn = findColumnByCardId(overCardId)

    // nếu không tồn tại 1 trong 2  column thì không làm gì cả tránh crash trang web
    if (!activeColumn || !overColumn) return
    /* Xử lý logic ở đây chỉ kéo thả card qua 2 column khác nhau, còn nếu kéo card trong chính column ban đầu của nó thì
    không làm gì.
    Vì ở đây đang là đoạn xử lý lúc kéo (handleDragOver), còn xử lý lúc kéo xong xuôi thì nó lại là vấn đề khác ở
    (handleDragEnd)*/
    if (activeColumn._id !== overColumn._id) {
      moveCardBetweenDifferentColumns(
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData
      )
    }
  }

  // Trigger Khi Kết thúc hành động kéo(drag) 1 phần tử => hành động thả (drop)
  const handleDragEnd = (event) => {
    const { active, over } = event
    // Kiểm tra nếu không tồn tại over thì return luôn tránh trường hợp kéo linh tinh ra ngoài gây ra lỗi
    if (!active || !over) return
    // console.log('activeDragItemId', activeDragItemId)
    // console.log('activeDragItemType', activeDragItemType)
    // console.log('activeDragItemData', activeDragItemData)

    // xử lý kéo thả cards

    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      // console.log ('hành động kéo thả Card - nhưng tạm thời không làm gì cả')
      // activeDraggingCard: Là Card đang được kéo
      const { id: activeDraggingCardId, data: { current:activeDraggingCardData } } = active

      // overCard: Là Card đang tương tác trên hoặc dưới so với cái Card đang được kéo ở trên
      const { id: overCardId } = over

      //  Tìm 2 cái Column theo CardID
      const activeColumn = findColumnByCardId(activeDraggingCardId)
      const overColumn = findColumnByCardId(overCardId)

      // nếu không tồn tại 1 trong 2  column thì không làm gì cả tránh crash trang web
      if (!activeColumn || !overColumn) return
      // Hành động kéo thả giữa 2 column khác nhau
      /* Phải dùng tới activeDragItemData.columnId hoặc oldColumnWhenDraggingCard._Id ( set vào State từ bước handleDragStart)
      chứ không phải activeData trong scope handleDragEnd này vì sau khi đi qua onDragOver tới đây là State đã bị cập nhật 1 lần rồi*/
      if (oldColumnWhenDraggingCard._id !== overColumn._id) {
        moveCardBetweenDifferentColumns(
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCardData
        )

      } else {
        //hành động kéo thả card trong một cái column
        // console.log ('hành động kéo thả Card trong cùng 1 column')

        // lấy vị trí cũ từ thằng oldColumnWhenDraggingCard
        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex(card => card._id === activeDragItemId)
        // lấy vị trí mới từ thằng overColumn
        const newCardIndex = overColumn?.cards?.findIndex(card => card._id === overCardId)
        // dùng arrayMove vì kéo card trong 1 column thì tương tự vớ logic kéo column trong một cái board Content
        const dndOrderedCardsState = arrayMove(oldColumnWhenDraggingCard?.cards, oldCardIndex, newCardIndex)
        // console.log('dndOrderedCardsState', dndOrderedCardsState)
        setOrderedColumnsState(prevColumns => {
          // Clone mảng OderedColumnsState cũ ra một cái mới để xử lý data rồi return - cập nhật lại OrderedColumnsState mới
          const nextColumns = cloneDeep(prevColumns)
          // Tìm tới column mà chúng ta đang thả
          const targetColumn = nextColumns.find(column => column._id === overColumn._id)

          // cập nhật lại 2 giá trị mới là card và cardOderIds trong cái targetColumn
          targetColumn.cards = dndOrderedCardsState
          targetColumn.cardOrderIds = dndOrderedCardsState.map(card => card._id)
          // console.log('targetColumn', targetColumn)

          // Trả về giá trị State mới ( chuẩn vị trí)
          return nextColumns
        })
      }
    }

    // xử lý kéo thả columns trong một cái boardContent
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      // console.log ('hành động kéo thả Caolumn - nhưng tạm thời không làm gì cả')

      // nếu vị trí sau khi kéo thả khác với vị trí ban đầu
      if (active.id !== over.id) {
        // lấy vị trí cũ từ thằng active
        const oldColumnIndex = orderedColumnsState.findIndex(c => c._id === active.id)
        // lấy vị trí mới từ thằng over
        const newColumnIndex = orderedColumnsState.findIndex(c => c._id === over.id)
        //Dùng arrayMove của thằng dnd-kit để sắp xếp lại mảng Columns ban đầu
        // code của thằng dnd-kit ở đây:dnd-kit/packages/sortable/src/ultilities/arrayMove.ts
        const dndOrderedColumnsState = arrayMove(orderedColumnsState, oldColumnIndex, newColumnIndex)
        // 2 cái console.log dữ liệu này sau dùng để xử lý gọi API.
        // const dndOrderedColumnsStateIds = dndOrderedColumnsState.map(c => c._id)
        // console.log('dndOrderedColumnsState', dndOrderedColumnsState)
        // console.log('dndOrderedColumnsStateIds', dndOrderedColumnsStateIds)

        // cập nhật lại State Columns ban đầu sau khi đã kéo thả
        setOrderedColumnsState(dndOrderedColumnsState)
      }
    }

    // Những dữ liệu sau khi được kéo thả này thì luôn luôn phải set (đưa về) giá trị ban đầu
    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
    setOldColumnWhenDraggingCard(null)
  }
  // Animation khi thả (drop) phần tử - Test bằng cách kéo thả trực tiếp nhìn vào phần giữ chỗ Overlay
  const customDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles:{
        active:{
          opacity:0.5
        }
      }
    })
  }

  // Chúng ta sẽ custom lại chiến lược / thuật toán phát hiện va chạm tối ưu cho việc kéo thả card qua nhiều column
  // args = arguments = các đối số, tham số
  const collisionDetectionStrategy = useCallback((args) => {
    // trường hợp kéo column thì dùng closestCorners là chuẩn nhất
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      return closestCorners ({ ...args })
    }
    // Tìm các điểm giao nhau, va chạm - intersections với con trỏ
    const pointerIntersections = pointerWithin(args)

    // Thuật toán phát hiện va chạm sẽ trả về một mảng va chạm ở đây
    const intersections = !!pointerIntersections?.length ? pointerIntersections : rectIntersection(args)
    let overId = getFirstCollision(intersections, 'id')
    if (overId) {
      /** Đoạn này dùng để fixering
       * nếu cái over nó là column thì sẽ tim tới cái cardId gần nhất bên trong khu vực va chạm đó dựa vào thuật toán phát
       hiện va chạm closestCenter hoặc closestCorners đều được. Tuy nhiên ở đây dùng closestCenter thấy mượt mà hơn*/
      const checkColumn = orderedColumnsState.find(column => column._id === overId)
      if(checkColumn) {
        // console.log('overId befor:', overId)
        overId = closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(container => {
            return(container.id !== overId)  && (checkColumn?.cardOrderIds?.includes(container.id))
          }) 
        })[0]?.id
        // console.log('overId after:', overId)
      }
      lastOverId.current = overId
      return[{ id:overId }]
    }
    // Nếu overId mà là null thì trả về mảng rỗng - tránh trường hợp crash trang web
    return lastOverId.current ? [{ id: lastOverId.current}] : []
  }, [activeDragItemType, orderedColumnsState])

  return (
    <DndContext
    // Cảm biến
      sensors={mySensors}
      /* Thuật toán phát hiện va chạm (nếu không có nó thì card với cover lớn sẽ không kéo qua Column được
      vì lúc này nó đang bị conflict giữa card và column), chúng ta sẽ dùng closestCorners thay vì dùng closestCenter
      https://docs.dndkit.com/api-documentation/context-provider/collision-detection-algorithms
      update video 37: nếu chỉ dùng closestCorners sẽ có bug flickering + sai lệch dữ liệu*/
      // collisionDetection={closestCorners}
      // tự custom nâng cao thuật toán phát hiện va chạm
      collisionDetection={collisionDetectionStrategy}

      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd} >
      <Box sx={{
        backgroundColor: (theme) => (theme.palette.mode === 'dark'? '#34495e' :'#4db6ac'),
        width:'100%',
        height:(theme) => theme.trello.boardContentHeight,
        p:'5px'
      }}>
        <ListColumns columns={orderedColumnsState}/>
        <DragOverlay dropAnimation={customDropAnimation}>
          {!activeDragItemType && null}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) && <Column column={activeDragItemData}/>}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) && <Card card={activeDragItemData}/>}
        </DragOverlay>
      </Box>
    </DndContext>
  )
}
export default BoardContent