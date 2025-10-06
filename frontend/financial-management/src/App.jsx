import { BrowserRouter as Router, Routes, Route, Navigate  } from 'react-router-dom'
import React from 'react'
import SignUp from './pages/Auth/SignUp'
import Home from './pages/Dashboard/Home'
import Login from './pages/Auth/Login'
import Income from './pages/Dashboard/Income'
import Expense from './pages/Dashboard/Expense'

function App() {
  return (
    <>
      <div>
        <Router>
          <Routes>
            <Route path='/' element={<Root />} />
            <Route path='/login' element={<Login />} />
            <Route path='/signUp' element={<SignUp />} />
            <Route path='/income' element={<Income />} />
            <Route path='/expense' element={<Expense />} />
            <Route path='/dashboard' element={<Home />} />
          </Routes>
        </Router>
      </div>
    </>
  )
}

export default App;

const Root = () => {
  // check if token exists in localstorage
  const isAuthenticated = !!localStorage.getItem('token');

  // Redirection to dashboard if token exists else to login
  return isAuthenticated ? (
    <Navigate to= "/dashboard" />
  ) : (
    <Navigate to= "/login" /> 
  )
}