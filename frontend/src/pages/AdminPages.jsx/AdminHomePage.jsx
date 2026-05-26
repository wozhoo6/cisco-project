import React, { useState } from 'react'

const AdminLayout = () => {
  const [active, setActive] = useState('dashboard')

  return (
    <div className="flex min-h-screen bg-[#f8f5f2]">
      <Sidebar active={active} setActive={setActive} />
      <MainContent active={active} />
    </div>
  )
}

// SIDEBAR
const Sidebar = ({ active, setActive }) => {
  const menus = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'products', label: 'Products' },
    { id: 'orders', label: 'Orders' },
    { id: 'customers', label: 'Customers' },
    { id: 'settings', label: 'Settings' }
  ]

  return (
    <div className="w-64 bg-white border-r border-[#eadfd8] p-5">
      <h1 className="text-2xl font-bold text-[#7B4A2E] mb-8">
        Cafe Admin
      </h1>

      <ul className="space-y-2">
        {menus.map(menu => (
          <li
            key={menu.id}
            onClick={() => setActive(menu.id)}
            className={`p-3 rounded-xl cursor-pointer transition ${
              active === menu.id
                ? 'bg-[#7B4A2E] text-white'
                : 'text-gray-600 hover:bg-[#f3ebe5]'
            }`}
          >
            {menu.label}
          </li>
        ))}
      </ul>
    </div>
  )
}

// MAIN CONTENT SWITCHER
const MainContent = ({ active }) => {
  switch (active) {
    case 'products':
      return <div className="p-6">Products Module</div>
    case 'orders':
      return <div className="p-6">Orders Module</div>
    case 'customers':
      return <div className="p-6">Customers Module</div>
    case 'settings':
      return <div className="p-6">Settings Module</div>
    default:
      return <Dashboard />
  }
}

// DASHBOARD (YOUR ORIGINAL PAGE)
const Dashboard = () => {
  const orders = [
    { id: 'DI-000045', name: 'Tite', total: 109, status: 'paid' },
    { id: 'TO-000044', name: 'Mobile test', total: 357, status: 'completed' },
    { id: 'DI-000043', name: 'ewqeq', total: 99, status: 'cancelled' }
  ]

  const stats = {
    totalProducts: 4,
    totalOrders: 5,
    paid: 1,
    completed: 1,
    cancelled: 3
  }

  return (
    <div className="flex-1 p-6">
      <h1 className="text-3xl font-extrabold text-[#7B4A2E] mb-6">
        Kape Cisco - Dashboard
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card title="Products" value={stats.totalProducts} />
        <Card title="Orders" value={stats.totalOrders} />
        <Card title="Paid" value={stats.paid} />
        <Card title="Completed" value={stats.completed} />
        <Card title="Cancelled" value={stats.cancelled} />
      </div>

      <div>
        <h2 className="text-xl font-bold text-[#7B4A2E] mb-3">
          Recent Orders
        </h2>

        <div className="bg-white rounded-2xl border border-[#eadfd8]">
          {orders.map((o, i) => (
            <div key={i} className="flex justify-between p-4 border-t">
              <span>{o.id}</span>
              <span>{o.name}</span>
              <span>₱{o.total}</span>
              <StatusBadge status={o.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// CARD
const Card = ({ title, value }) => (
  <div className="bg-white rounded-2xl border border-[#eadfd8] p-4 text-center">
    <p className="text-sm text-gray-500">{title}</p>
    <h2 className="text-2xl font-bold text-[#7B4A2E]">{value}</h2>
  </div>
)

// STATUS BADGE
const StatusBadge = ({ status }) => {
  const colors = {
    paid: 'bg-green-100 text-green-600',
    completed: 'bg-blue-100 text-blue-600',
    cancelled: 'bg-red-100 text-red-600'
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs ${colors[status]}`}>
      {status}
    </span>
  )
}

export default AdminLayout