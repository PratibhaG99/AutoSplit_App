import React from 'react'
import { Routes,Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Group from './pages/Group'
import AddExpense from './pages/AddExpense'

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Home/>} />
      <Route path='/autosplit/login' element={<Login/>} />
      <Route path='/autosplit/register' element={<Register/>} />
      <Route path='/autosplit/group/:gid' element={<Group />} />
      <Route path='/autosplit/addExpense/:gid' element={<AddExpense />} />
    </Routes>
  )
}

export default App