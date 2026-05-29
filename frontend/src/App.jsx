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
import AdminLayout from './pages/AdminPages.jsx/AdminLayout'
import AdminDashboard from './pages/AdminPages.jsx/AdminDashboard'

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

      <Route path='/menu/:storeId' element={<ItemPage />} />
      <Route path='/cart/:storeId' element={<CartPage />} />
      <Route
        path='/confirmation/:storeId/:orderId'
        element={<ConfirmationPage />}
      />

      {/* ADMIN ROUTE */}
      <Route
        path='/admin'
        element={
          user && user.role === 'admin' ? (
            <AdminLayout />
          ) : (
            <Navigate to='/login' />
          )
        }
      >
        <Route index element={<AdminDashboard />} />
        {/* <Route path='products' element={<AdminProducts />} />
        <Route path='orders' element={<AdminOrders />} />
        <Route path='customers' element={<AdminCustomers />} />
        <Route path='settings' element={<AdminSettings />} /> */}
      </Route>

    </Routes>
  )
}

export default App
