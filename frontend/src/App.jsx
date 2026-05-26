import React, { useEffect } from 'react'
import { useState } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'

import LoadingSpinner from './components/LoadingSpinner'

import LoginPage from './pages/StorePages/LoginPage'

// STORE PAGES
import { useUserStore } from './stores/useUserStore'

// MENU PAGES
import ItemPage from './pages/CustomerPages/ItemPage'
import CartPage from './pages/CustomerPages/CartPage'
import ConfirmationPage from './pages/CustomerPages/ConfirmationPage'

// Store Pages
import StoreOrdersPage from './pages/StorePages/StoreOrdersPage'

// Admin Pages

import AdminLayout from './pages/AdminPages.jsx/AdminHomePage'

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
            ) : user.role === 'admin' ? (
              <Navigate to='/admin' />
            ) : (
              <Navigate to='/login' />
            )
          ) : (
            <Navigate to='/login' />
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

      <Route
        path='/admin'
        element={
          user && user.role == 'admin' ? (
            <AdminLayout />
          ) : (
            <Navigate to='/login' />
          )
        }
      />

      <Route path='/menu/:storeId' element={<ItemPage />} />
      <Route path='/cart/:storeId' element={<CartPage />} />
      <Route
        path='/confirmation/:storeId/:orderId'
        element={<ConfirmationPage />}
      />
    </Routes>
  )
}

export default App
