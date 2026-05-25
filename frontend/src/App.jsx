import React, { useEffect } from 'react'
import { useState } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'

import LoadingSpinner from './components/LoadingSpinner'

// STORE PAGES
import { useUserStore } from './stores/useUserStore'

// MENU PAGES
import ItemPage from './pages/CustomerPages/ItemPage'
import CartPage from './pages/CustomerPages/CartPage'
import ConfirmationPage from './pages/CustomerPages/ConfirmationPage'

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

      <Route path='/menu/:storeId' element={<ItemPage />} />
      <Route path='/cart/:storeId' element={<CartPage />} />
      <Route path='/confirmation/:storeId/:orderId' element={<ConfirmationPage />} />

    </Routes>
  )
}

export default App
