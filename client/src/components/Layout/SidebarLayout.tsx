import React, { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "../Sidebar/sidebar"
import { cn } from "../../lib/utils"

const SidebarLayout = () => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen w-full flex font-cal-sans bg-gray-50 overflow-x-hidden">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className="flex-1 w-full overflow-x-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default SidebarLayout
