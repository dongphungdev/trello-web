import { experimental_extendTheme as extendTheme } from '@mui/material/styles'
import { cyan, deepOrange, orange, teal } from '@mui/material/colors'

const APP_BAR_HEIGHT = '58px'
const BOARD_BAR_HEIGHT = '58px'
const BOARD_CONTENT_HEIGHT = `calc(100vh - ${APP_BAR_HEIGHT} - ${BOARD_BAR_HEIGHT})`
const COLUMN_HEADER_HEIGHT ='50px'
const COLUMN_FOOTER_HEIGHT ='56px'


// Create a theme dack-mode.
const theme = extendTheme({
  trello:{
    appBarHeight:APP_BAR_HEIGHT,
    boardBarHeight:BOARD_BAR_HEIGHT,
    boardContentHeight:BOARD_CONTENT_HEIGHT,
    columnHeaderHeight:COLUMN_HEADER_HEIGHT,
    columnFooterHeight:COLUMN_FOOTER_HEIGHT
  },
  colorSchemes: {
    light: {
      palette: {
        primary: teal,
        secondary:deepOrange
      }
    },
    dark: {
      palette: {
        primary: cyan,
        secondary: orange
      }
    }
  },
  // ...other properties
  components: {
    CssBaseline:{
      styleOverrides:{
        body:{
          '*::-webkit-screenbar':{
            with:'8px',
            Height:'8px'
          },
          '*::-webkit-screenbar-thumb':{
            backgroundColor:'#bdc3c7',
            borderRadius:'8px'
          },
          '*::-webkit-screenbar-thumb:hover':{
            backgroundColor:'#00b894',
            borderRadius:'8px'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform:'none'
        }
      }
    }
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        color: theme.palette.primary.main,
        '.MuiOutlinedInput-notchedOutline':{
          BorderColor: theme.palette.primary.light
        },
        '&:hover':{
          bgcolor:'primary.50'
        }
      })
    }
  },
  MuiInputLabel: {
    styleOverrides: {
      root: {
        fontSize:'0.875rem'
      }
    }
  },
  MuiTypography: {
    styleOverrides:{
      root: { fontSize:'0.875rem' }
    }
  }
})
export default theme