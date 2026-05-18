import React, { useEffect } from 'react'
import { useState } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'

import LoadingSpinner from './components/LoadingSpinner'
// STORES
import { useUserStore } from './stores/useUserStore'

import LoginPage from './pages/StorePages/LoginPage'

// Store Pages
import StoreOrdersPage from './pages/StorePages/StoreOrdersPage'

function App () {
  const { user, checkAuth, checkingAuth } = useUserStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (checkingAuth) return <LoadingSpinner />
  return (
    <Routes>
      <Route
        path='/'
        element={
          user ? (
            user.role === 'store' ? (
              <Navigate to='/orders' />
            ) : (
              <Navigate to='/login' />
            )
          ) : (
            <LoginPage />
          )
        }
      />

      <Route
        path='/login'
        element={user ? <Navigate to='/' /> : <LoginPage />}
      />

      <Route
        path='/orders'
        element={!user ? <Navigate to='/login' /> : <StoreOrdersPage />}
      />
    </Routes>
  )
}

export default App
