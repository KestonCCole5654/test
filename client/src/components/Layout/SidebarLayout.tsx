import React, { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "../Sidebar/sidebar"
import { cn } from "../../lib/utils"

const SidebarLayout = () => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen flex font-cal-sans bg-gray-50">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className={cn(
        "flex-1 transition-all duration-300",
        collapsed ? "ml-[70px]" : "ml-[250px]"
      )}>
        <Outlet />
      </main>
    </div>
  )
}

export default SidebarLayout
