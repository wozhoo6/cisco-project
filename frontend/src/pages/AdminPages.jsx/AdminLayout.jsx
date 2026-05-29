import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import { useState, React } from 'react'

const AdminLayout = () => {
  const [active, setActive] = useState(false)

  return (
    <div className='flex min-h-screen bg-[#f8f5f2]'>
      <AdminSidebar active={active} setActive={setActive} />

      <div className='flex-1'>
        <Outlet />
      </div>
    </div>
  )
}

export default AdminLayout
