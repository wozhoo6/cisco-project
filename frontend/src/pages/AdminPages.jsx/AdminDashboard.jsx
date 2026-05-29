import React from 'react'
import { useOrderStore } from '../../stores/useOrderStore'
import { useEffect } from 'react'
import { useState } from 'react'
import Card from '../../components/StatusCard'

const AdminDashboard = () => {
  const { orders, loading, getAllOrders, statusCount } = useOrderStore()

  const [filters, setFilters] = useState({
    status: '',
    store_id: '',
    customer_name: '',
    from_date: '',
    to_date: '',
    limit: 10,
    offset: 0
  })

  useEffect(() => {
    const timeout = setTimeout(() => {
      getAllOrders(filters)
    }, 400)

    return () => clearTimeout(timeout)
  }, [filters])

  return (
    <div className='p-6'>
      <h1 className='text-3xl font-extrabold text-[#7B4A2E] mb-6'>
        Kape Cisco - Dashboard
      </h1>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8'>
        <Card title='Pending' value={statusCount.pending} />
        <Card title='Paid' value={statusCount.paid} />
        <Card title='Preparing' value={statusCount.preparing} />
        <Card title='Ready' value={statusCount.ready} />
        <Card title='Completed' value={statusCount.completed} />
        <Card title='Cancelled' value={statusCount.cancelled} />
      </div>
      {/* FILTER SECTION */}
      <div className='bg-white border border-[#eadfd8] rounded-2xl p-5 mb-8 shadow-sm'>
        <h3 className='text-lg font-semibold text-[#7B4A2E] mb-4'>
          Filter Orders
        </h3>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Status */}
          <div className='flex flex-col'>
            <label className='text-sm text-gray-600 mb-1'>Status</label>
            <select
              className='border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7B4A2E]'
              value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value })}
            >
              <option value=''>All Status</option>
              <option value='paid'>Paid</option>
              <option value='completed'>Completed</option>
              <option value='cancelled'>Cancelled</option>
            </select>
          </div>

          {/* Customer */}
          <div className='flex flex-col'>
            <label className='text-sm text-gray-600 mb-1'>Customer</label>
            <input
              type='text'
              placeholder='Search customer...'
              className='border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7B4A2E]'
              value={filters.customer_name}
              onChange={e =>
                setFilters({ ...filters, customer_name: e.target.value })
              }
            />
          </div>

          {/* Limit */}
          <div className='flex flex-col'>
            <label className='text-sm text-gray-600 mb-1'>Limit</label>
            <input
              type='number'
              className='border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7B4A2E]'
              value={filters.limit}
              onChange={e => setFilters({ ...filters, limit: e.target.value })}
            />
          </div>

          {/* From Date */}
          <div className='flex flex-col'>
            <label className='text-sm text-gray-600 mb-1'>From Date</label>
            <input
              type='date'
              className='border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7B4A2E]'
              value={filters.from_date}
              onChange={e =>
                setFilters({ ...filters, from_date: e.target.value })
              }
            />
          </div>

          {/* To Date */}
          <div className='flex flex-col'>
            <label className='text-sm text-gray-600 mb-1'>To Date</label>
            <input
              type='date'
              className='border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7B4A2E]'
              value={filters.to_date}
              onChange={e =>
                setFilters({ ...filters, to_date: e.target.value })
              }
            />
          </div>

          {/* Reset Button */}
          <div className='flex items-end'>
            <button
              onClick={() =>
                setFilters({
                  status: '',
                  store_id: '',
                  customer_name: '',
                  from_date: '',
                  to_date: '',
                  limit: 10,
                  offset: 0
                })
              }
              className='w-full bg-[#7B4A2E] text-white rounded-xl py-2 hover:opacity-90 transition'
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      <h2 className='text-xl font-bold text-[#7B4A2E] mb-3'>Recent Orders</h2>

      <div className='bg-white rounded-2xl border border-[#eadfd8] overflow-hidden shadow-sm'>
        {/* TABLE HEADER */}
        <div className='grid grid-cols-6 bg-[#f7efe9] px-6 py-4 text-sm font-semibold text-[#7B4A2E]'>
          <span>Order ID</span>
          <span>Store</span>
          <span>Customer</span>
          <span>Date</span>
          <span>Total</span>
          <span>Status</span>
        </div>

        {/* TABLE BODY */}
        {orders.length > 0 ? (
          orders.map((o, i) => (
            <div
              key={i}
              className='grid grid-cols-6 items-center px-6 py-4 border-t border-[#f1e5dc] hover:bg-[#fcf8f5] transition'
            >
              {/* ORDER ID */}
              <div className='font-medium text-gray-700'>{o.display_id}</div>

              {/* STORE */}
              <div className='text-gray-600'>
                {o.store_name?.user?.username || 'N/A'}
              </div>

              {/* CUSTOMER */}
              <div className='text-gray-600'>{o.customer_name}</div>

              {/* DATE */}
              <div className='text-gray-500 text-sm'>
                {new Date(o.created_at).toLocaleDateString()}
              </div>

              {/* TOTAL */}
              <div className='font-semibold text-[#7B4A2E]'>₱{o.total}</div>

              {/* STATUS */}
              <div>
                <StatusBadge status={o.status} />
              </div>
            </div>
          ))
        ) : (
          <div className='p-10 text-center text-gray-400'>No orders found</div>
        )}
      </div>
    </div>
  )
}

const StatusBadge = ({ status }) => {
  const colors = {
    paid: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
    pending: 'bg-yellow-100 text-yellow-700'
  }

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${colors[status]}`}
    >
      {status}
    </span>
  )
}

export default AdminDashboard
