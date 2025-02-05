import { useState } from 'react'
import Box from '@mui/material/Box'
import {
  Container,
  TextField,
  Button,
  Typography,
  Tabs,
  Tab
} from '@mui/material'

function Login() {
  const [tab, setTab] = useState(0)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Xử lý đăng nhập hay đăng ký ở đây
    console.log(formData)
  }

  const handleTabChange = (event, newValue) => {
    setTab(newValue)
    setFormData({ username: '', password: '', email: '' }) // reset form data khi chuyển tab
  }
  return (
    <>
      <Container component="main" maxWidth="xs" sx={{ mt:'50px', height:'500px', border:'1px solid grey', boxShadow:'1px 3px 3px grey', backgroundColor:'white' }}>
        <Typography component="h1" variant="h5"sx={{ textAlign:'center',margin:'40px 0 10px 0' }}>
          {tab === 0 ? 'Đăng Nhập Tài Khoản' : 'Đăng Ký Tài Khoản'}
        </Typography>
        <Tabs value={tab} onChange={handleTabChange} centered >
          <Tab label="Đăng Nhập" />
          <Tab label="Đăng Ký" />
        </Tabs> 
        <form onSubmit={handleSubmit}>
          <Box mt={2}>
            <TextField
              variant="outlined"
              required
              fullWidth
              label="Tên đăng nhập"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
          </Box>
          {tab === 1 && (
            <Box mt={2}>
              <TextField
                variant="outlined"
                required
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Box>
          )}
          <Box mt={2}>
            <TextField
              variant="outlined"
              required
              fullWidth
              label="Mật khẩu"
              type="password"
              autoComplete='off'
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </Box>
          <Box mt={2}>
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{mt:'40px'}}>
              {tab === 0 ? 'Đăng Nhập' : 'Đăng Ký'}
            </Button>
          </Box>
        </form>
      </Container>
    </>
  )
}

export default Login
