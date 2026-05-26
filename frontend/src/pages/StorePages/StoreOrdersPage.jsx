import { useEffect, useState, useRef } from 'react'
import { Coffee, Clock, CheckCircle, XCircle, Package } from 'lucide-react'
import { QrCode, X } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import LoadingSpinner from '../../components/LoadingSpinner'

import { useOrderStore } from '../../stores/useOrderStore'
import { useUserStore } from '../../stores/useUserStore'

const statusStyles = {
  pending: {
    badge: 'bg-amber-100 text-amber-800',
    border: 'border-l-4 border-amber-400'
  },
  paid: {
    badge: 'bg-sky-100 text-sky-800',
    border: 'border-l-4 border-sky-400'
  },
  preparing: {
    badge: 'bg-orange-100 text-orange-800',
    border: 'border-l-4 border-orange-400'
  },
  ready: {
    badge: 'bg-violet-100 text-violet-800',
    border: 'border-l-4 border-violet-400'
  },
  completed: {
    badge: 'bg-emerald-100 text-emerald-800',
    border: 'border-l-4 border-emerald-400'
  },
  cancelled: {
    badge: 'bg-rose-100 text-rose-800',
    border: 'border-l-4 border-rose-400'
  }
}

const statusIcons = {
  pending: Clock,
  paid: CheckCircle,
  preparing: Package,
  ready: CheckCircle,
  completed: CheckCircle,
  cancelled: XCircle
}

const activeStatusOrder = ['ready', 'pending', 'paid', 'preparing']
const archiveStatusOrder = ['completed', 'cancelled']
const viewOptions = ['active', ...archiveStatusOrder]

const renderOrderCard = (order, handleUpdateOrder, handleCancelOrder) => {
  const Icon = statusIcons[order.status]
  const isLate =
    order.status === 'pending' &&
    new Date() - new Date(order.created_at) > 10 * 60 * 1000

  const orderDetails = Array.isArray(order.order_details)
    ? order.order_details
    : []

  return (
    <div
      key={order.order_id}
      className={`bg-white rounded-xl shadow-sm p-4 border ${
        statusStyles[order.status]?.border
      } hover:shadow-md transition-transform duration-150 hover:-translate-y-0.5`}
    >
      <div className='flex justify-between items-center mb-1'>
        <h2 className='font-semibold text-sm text-[#7B4A2E]'>
          {order.display_id}
        </h2>
        <span
          className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full capitalize ${
            statusStyles[order.status]?.badge
          }`}
        >
          <Icon size={12} />
          {order.status}
        </span>
      </div>

      <div className='text-[11px] text-gray-600 flex justify-between'>
        <span>{order.customer_name}</span>
        <span>{order.order_type === 'DI' ? 'Dine In' : 'TO'}</span>
      </div>

      <div className='text-[10px] text-gray-500 flex justify-between mb-2'>
        <span>{new Date(order.created_at).toLocaleTimeString()}</span>
        {isLate && <span className='text-red-500 font-semibold'>⚠</span>}
      </div>

      <div className='text-[11px] border-t pt-2 space-y-0.5'>
        {orderDetails.slice(0, 2).map((item, idx) => (
          <div key={idx} className='flex justify-between'>
            <span className='truncate'>
              {item.product_details?.name || 'Item'}
            </span>
            <span>x{item.quantity}</span>
          </div>
        ))}
        {!orderDetails.length && (
          <p className='text-gray-400 text-[10px]'>No items yet</p>
        )}
        {orderDetails.length > 2 && (
          <p className='text-gray-400 text-[10px]'>
            +{orderDetails.length - 2} more
          </p>
        )}
      </div>

      <div className='flex justify-between items-center mt-3'>
        <span className='font-bold text-sm text-[#7B4A2E]'>₱{order.total}</span>
        <div className='flex gap-1'>
          {order.status === 'pending' && (
            <div className='flex gap-2'>
              <button
                onClick={() => handleUpdateOrder(order)}
                className='bg-blue-500 text-white px-2 py-0.5 rounded text-[10px]'
              >
                Accept
              </button>

              <button
                onClick={() => handleCancelOrder(order)}
                className='bg-red-500 text-white px-2 py-0.5 rounded text-[10px]'
              >
                Cancel
              </button>
            </div>
          )}

          {order.status === 'paid' && (
            <button
              onClick={() => handleUpdateOrder(order)}
              className='bg-orange-500 text-white px-2 py-0.5 rounded text-[10px]'
            >
              Prep
            </button>
          )}

          {order.status === 'preparing' && (
            <button
              onClick={() => handleUpdateOrder(order)}
              className='bg-purple-500 text-white px-2 py-0.5 rounded text-[10px]'
            >
              Ready
            </button>
          )}

          {order.status === 'ready' && (
            <button
              onClick={() => handleUpdateOrder(order)}
              className='bg-green-500 text-white px-2 py-0.5 rounded text-[10px]'
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const StoreOrdersPage = () => {
  const [selectedView, setSelectedView] = useState('active')
  const [showQr, setShowQr] = useState(false)

  const [overdueOrder, setOverdueOrder] = useState(null)

  const {
    orders,
    getActiveOrders,
    loading,
    subscribeToOrders,
    unsubscribeFromOrders,
    updateOrderStatus,
    getOrderByStatus
  } = useOrderStore()

  const { storeIdentifier, logout } = useUserStore()

  const isOverdue = order => {
    return (
      order.status === 'pending' &&
      new Date() - new Date(order.created_at) > 15 * 60 * 1000
    )
  }

  const handleUpdateOrder = async order => {
    const nextStatusMap = {
      pending: 'paid',
      paid: 'preparing',
      preparing: 'ready',
      ready: 'completed'
    }

    const nextStatus = nextStatusMap[order.status]
    if (!nextStatus) return

    await updateOrderStatus(order.order_id, nextStatus)
  }

  const handleCancelOrder = async order => {
    const overdue = isOverdue(order)

    if (overdue) {
      const confirmCancel = window.confirm(
        `This order (${order.display_id}) has been pending for over 15 minutes.\n\nDo you still want to cancel it?`
      )

      if (!confirmCancel) return
    }

    await updateOrderStatus(order.order_id, 'cancelled')
  }

  const handleLogout = async () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?')
    if (!confirmLogout) return

    await logout()
  }

  const handleChangeSelectedView = async viewOption => {
    if (viewOption === 'active') {
      await getActiveOrders()
      setSelectedView(viewOption)
      return
    }

    await getOrderByStatus(viewOption)
    setSelectedView(viewOption)
    return
  }

  useEffect(() => {
    getActiveOrders()
    subscribeToOrders()

    return () => {
      unsubscribeFromOrders()
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (!orders?.length) return

      const overdue = orders.find(order => {
        const isPending = order.status === 'pending'
        const isOver15Min =
          new Date() - new Date(order.created_at) > 15 * 60 * 1000

        return isPending && isOver15Min
      })

      if (overdue) {
        setOverdueOrder(overdue)
      }
    }, 5000) // check every 5 seconds

    return () => clearInterval(interval)
  }, [orders])

  if (loading) return <LoadingSpinner />

  const safeOrders = Array.isArray(orders) ? orders : []

  const groupedOrders = safeOrders.reduce((acc, order) => {
    if (!acc[order.status]) acc[order.status] = []
    acc[order.status].push(order)
    return acc
  }, {})

  const visibleStatusOrder =
    selectedView === 'active' ? activeStatusOrder : [selectedView]

  const renderStatusSection = status => {
    const statusOrders = groupedOrders[status] || []
    if (!statusOrders.length) return null

    const Icon = statusIcons[status]

    return (
      <div key={status}>
        <div className='flex items-center gap-2 mb-2'>
          <Icon size={18} className='text-[#7B4A2E]' />
          <h2 className='text-lg font-bold capitalize text-[#7B4A2E]'>
            {status} ({statusOrders.length})
          </h2>
        </div>

        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {statusOrders.map(order =>
            renderOrderCard(order, handleUpdateOrder, handleCancelOrder)
          )}
        </div>
      </div>
    )
  }

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <header className='flex items-center justify-between mb-4'>
        <h1 className='text-2xl font-bold text-[#7B4A2E]'>
          {selectedView.charAt(0).toUpperCase() + selectedView.slice(1)} Orders
        </h1>

        <div className='flex gap-2 items-center'>
          {viewOptions.map(v => (
            <button
              key={v}
              onClick={() => handleChangeSelectedView(v)}
              className={`px-3 py-1 rounded-full text-sm capitalize border ${
                selectedView === v
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white text-gray-700 border-gray-200'
              }`}
            >
              {v}
            </button>
          ))}

          {/* QR BUTTON */}
          <button
            onClick={() => setShowQr(true)}
            className='bg-[#7B4A2E] text-white p-2 rounded-md'
          >
            <QrCode size={16} />
          </button>

          {/* ✅ LOGOUT BUTTON */}
          <button
            onClick={handleLogout}
            className='bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600'
          >
            Logout
          </button>
        </div>
      </header>
      
      <main>
        {visibleStatusOrder.map(renderStatusSection)}

        {visibleStatusOrder.every(s => !(groupedOrders[s] || []).length) && (
          <p className='text-gray-500'>No orders to display.</p>
        )}
      </main>
      {showQr && (
        <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'>
          <div className='bg-white w-full max-w-sm rounded-2xl p-5 relative'>
            <button
              onClick={() => setShowQr(false)}
              className='absolute top-3 right-3 text-gray-500'
            >
              <X size={20} />
            </button>

            <h2 className='text-lg font-bold text-center text-[#7B4A2E]'>
              Menu QR Code
            </h2>

            <p className='text-xs text-gray-500 text-center mb-4'>
              Scan to open store menu
            </p>

            <div className='flex justify-center'>
              <QRCodeCanvas
                value={`http://192.168.8.15:5173/menu/${storeIdentifier}`}
                size={220}
                fgColor='#7B4A2E'
                bgColor='#ffffff'
                level='H'
                includeMargin
              />
            </div>

            <p className='text-xs text-center text-gray-500 mt-4'>
              http://192.168.8.15:5173/menu/{storeIdentifier}
            </p>
          </div>
        </div>
      )}
      {overdueOrder && (
        <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'>
          <div className='bg-white w-full max-w-sm rounded-2xl p-5 text-center shadow-xl'>
            <h2 className='text-xl font-bold text-red-600 mb-2'>
              ⚠ Overdue Order
            </h2>

            <p className='text-sm text-gray-600 mb-4'>
              Order <b>{overdueOrder.display_id}</b> has been pending for over
              15 minutes.
            </p>

            <p className='text-xs text-gray-500 mb-6'>
              Do you want to cancel this order?
            </p>

            <div className='flex gap-2'>
              <button
                onClick={() => setOverdueOrder(null)}
                className='flex-1 border py-2 rounded-lg'
              >
                Keep
              </button>

              <button
                onClick={async () => {
                  await updateOrderStatus(overdueOrder.order_id, 'cancelled')
                  setOverdueOrder(null)
                }}
                className='flex-1 bg-red-600 text-white py-2 rounded-lg'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StoreOrdersPage
