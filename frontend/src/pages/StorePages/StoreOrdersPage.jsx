import { useEffect, useState } from 'react'
import { Coffee, Clock, CheckCircle, XCircle, Package } from 'lucide-react'
import LoadingSpinner from '../../components/LoadingSpinner'

import { useOrderStore } from '../../stores/useOrderStore'

const statusStyles = {
  pending: {
    badge: 'bg-yellow-100 text-yellow-700',
    border: 'border-l-4 border-yellow-400'
  },
  paid: {
    badge: 'bg-blue-100 text-blue-700',
    border: 'border-l-4 border-blue-400'
  },
  preparing: {
    badge: 'bg-orange-100 text-orange-700',
    border: 'border-l-4 border-orange-400'
  },
  ready: {
    badge: 'bg-purple-100 text-purple-700',
    border: 'border-l-4 border-purple-400'
  },
  completed: {
    badge: 'bg-green-100 text-green-700',
    border: 'border-l-4 border-green-500'
  },
  cancelled: {
    badge: 'bg-red-100 text-red-700',
    border: 'border-l-4 border-red-500'
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

const renderOrderCard = order => {
  const Icon = statusIcons[order.status]
  const isLate =
    order.status === 'pending' &&
    new Date() - new Date(order.created_at) > 10 * 60 * 1000

  return (
    <div
      key={order.order_id}
      className={`bg-white rounded-xl shadow-sm p-4 border ${
        statusStyles[order.status]?.border
      }`}
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
        {order.order_details.slice(0, 2).map((item, idx) => (
          <div key={idx} className='flex justify-between'>
            <span className='truncate'>{item.product_details.name}</span>
            <span>x{item.quantity}</span>
          </div>
        ))}
        {order.order_details.length > 2 && (
          <p className='text-gray-400 text-[10px]'>
            +{order.order_details.length - 2} more
          </p>
        )}
      </div>

      <div className='flex justify-between items-center mt-3'>
        <span className='font-bold text-sm text-[#7B4A2E]'>₱{order.total}</span>
        <div className='flex gap-1'>
          {order.status === 'pending' && (
            <button className='bg-blue-500 text-white px-2 py-0.5 rounded text-[10px]'>
              Accept
            </button>
          )}
          {order.status === 'paid' && (
            <button className='bg-orange-500 text-white px-2 py-0.5 rounded text-[10px]'>
              Prep
            </button>
          )}
          {order.status === 'preparing' && (
            <button className='bg-purple-500 text-white px-2 py-0.5 rounded text-[10px]'>
              Ready
            </button>
          )}
          {order.status === 'ready' && (
            <button className='bg-green-500 text-white px-2 py-0.5 rounded text-[10px]'>
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

  const { orders, getActiveOrders, loading } = useOrderStore()

  useEffect(() => {
    console.log('check')
    if (orders.length === 0) {
      getActiveOrders()
    }
  }, [])

  const groupedOrders = orders.reduce((acc, order) => {
    if (!acc[order.status]) acc[order.status] = []
    acc[order.status].push(order)
    return acc
  }, {})

  const visibleStatusOrder =
    selectedView === 'active' ? activeStatusOrder : [selectedView]

  const renderStatusSection = status => {
    const orders = groupedOrders[status] || []
    if (!orders.length) return null

    const Icon = statusIcons[status]

    if (loading) return <LoadingSpinner />

    return (
      <div key={status}>
        <div className='flex items-center gap-2 mb-2'>
          <Icon size={18} className='text-[#7B4A2E]' />
          <h2 className='text-lg font-bold capitalize text-[#7B4A2E]'>
            {status} ({orders.length})
          </h2>
        </div>

        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {orders.map(renderOrderCard)}
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-[#F5E6D3] p-6'>
      <div className='flex items-center gap-3 mb-6'>
        <Coffee className='text-[#7B4A2E]' size={28} />
        <h1 className='text-2xl font-bold text-[#7B4A2E]'>Store Orders</h1>
      </div>

      <div className='mb-8 rounded-3xl bg-white p-4 shadow-sm'>
        <div className='flex flex-wrap gap-3'>
          {viewOptions.map(view => (
            <button
              key={view}
              type='button'
              onClick={() => setSelectedView(view)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                selectedView === view
                  ? 'bg-[#7B4A2E] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {view === 'active'
                ? 'Active'
                : view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
        <div className='mt-4 text-sm text-slate-600'>
          {selectedView === 'active'
            ? 'Showing active orders in the pending → ready flow.'
            : `Showing ${selectedView} orders.`}
        </div>
      </div>

      <div className='space-y-10'>
        {visibleStatusOrder.map(renderStatusSection)}

        {!visibleStatusOrder.some(
          status => (groupedOrders[status] || []).length
        ) && (
          <div className='rounded-3xl bg-white p-8 text-center text-slate-500 shadow-sm'>
            No {selectedView === 'active' ? 'active' : selectedView} orders
            available.
          </div>
        )}
      </div>
    </div>
  )
}

export default StoreOrdersPage
