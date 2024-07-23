
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './authentication/AuthContext'
import Signin from './pages/signin'
import Signup from './pages/signup'
import MainPage from './pages/mainpage'

function App() {

  return <div>
    <AuthProvider>
    <BrowserRouter>
    <Routes>
      <Route path="/signin" element={<Signin />} ></Route>
      <Route path="/signup" element={<Signup />} ></Route>
      <Route path="/main" element={<MainPage/>} ></Route>
      <Route path='*' element={<Navigate to='/signin'/>}/>
    </Routes>
    </BrowserRouter>
    </AuthProvider>
  </div>
}

export default App
