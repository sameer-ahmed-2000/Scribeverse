
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './authentication/AuthContext'
import Signin from './pages/signin'
import Signup from './pages/signup'
import MainPage from './pages/mainpage'
import InterestSelector from './pages/interest'
import { PublicRoute } from './authentication/PublicRoute'
import { ProtectedRoute } from './authentication/ProtectedRoute'
import { Provider } from 'react-redux'
import { store } from './store/store'

function App() {

  return <div>
    <Provider store={store}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/signin" element={<PublicRoute><Signin /></PublicRoute>} ></Route>
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} ></Route>
            <Route path="/main" element={<ProtectedRoute><MainPage /></ProtectedRoute>} ></Route>
            <Route path='/interest' element={<ProtectedRoute><InterestSelector /></ProtectedRoute>}></Route>
            <Route path='*' element={<Navigate to='/signin' />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </Provider>

  </div>
}

export default App
