import { useEffect, useState } from 'react'
import { Coffee, Clock, CheckCircle, XCircle, Package } from 'lucide-react'
import LoadingSpinner from '../../components/LoadingSpinner'

import { useOrderStore } from '../../stores/useOrderStore'

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

const activeStatusOrder = ['pending', 'paid', 'preparing', 'ready']
const archiveStatusOrder = ['completed', 'cancelled']
const viewOptions = ['active', ...archiveStatusOrder]

const renderOrderCard = (order, handleUpdateOrder) => {
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
            <button
              onClick={() => handleUpdateOrder(order)}
              className='bg-blue-500 text-white px-2 py-0.5 rounded text-[10px]'
            >
              Accept
            </button>
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

  const {
    orders,
    getActiveOrders,
    loading,
    subscribeToOrders,
    unsubscribeFromOrders,
    updateOrderStatus,
  } = useOrderStore()

  const handleUpdateOrder = async (order) => {
    const nextStatusMap = {
      pending: 'paid',
      paid: 'preparing',
      preparing: 'ready',
      ready: 'completed',
    }

    const nextStatus = nextStatusMap[order.status]
    if (!nextStatus) return

    await updateOrderStatus(order.order_id, nextStatus)
  }

  useEffect(() => {
    getActiveOrders()
    subscribeToOrders()

    return () => {
      unsubscribeFromOrders()
    }
  }, [])

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
          {statusOrders.map((order) => renderOrderCard(order, handleUpdateOrder))}
        </div>
      </div>
    )
  }

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <header className='flex items-center justify-between mb-4'>
        <h1 className='text-2xl font-bold text-[#7B4A2E]'>Orders</h1>
        <div className='flex gap-2'>
          {viewOptions.map(v => (
            <button
              key={v}
              onClick={() => setSelectedView(v)}
              className={`px-3 py-1 rounded-full text-sm capitalize border ${
                selectedView === v
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white text-gray-700 border-gray-200'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </header>

      <main>
        {visibleStatusOrder.map(renderStatusSection)}

        {visibleStatusOrder.every(s => !(groupedOrders[s] || []).length) && (
          <p className='text-gray-500'>No orders to display.</p>
        )}
      </main>
    </div>
  )
}

export default StoreOrdersPage
