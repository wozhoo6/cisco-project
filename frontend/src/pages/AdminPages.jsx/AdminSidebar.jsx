import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ShoppingBag, Package, Users, Settings } from 'lucide-react'

const AdminSidebar = () => {
  const menus = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/products', label: 'Products', icon: ShoppingBag },
    { to: '/admin/stores', label: 'Stores', icon: Users },
  ]

  return (
    <aside className="w-64 bg-white border-r border-[#eadfd8] p-5">
      <h1 className="text-2xl font-bold text-[#7B4A2E] mb-8">
        Cafe Admin
      </h1> 

      <div className="flex flex-col space-y-2">
        {menus.map(menu => {
          const Icon = menu.icon

          return (
            <NavLink
              key={menu.to}
              to={menu.to}
              end={menu.end}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-xl transition ${
                  isActive
                    ? 'bg-[#7B4A2E] text-white'
                    : 'text-gray-600 hover:bg-[#f3ebe5]'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{menu.label}</span>
            </NavLink>
          )
        })}
      </div>
    </aside>
  )
}

export default AdminSidebar