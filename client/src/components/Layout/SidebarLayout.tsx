import React, { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "../Sidebar/sidebar"
import { cn } from "../../lib/utils"

const SidebarLayout = () => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={cn(
        "flex-1 overflow-auto transition-all duration-300",
        collapsed ? "ml-[70px]" : "ml-[250px]"
      )}>
        <main className="h-full">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default SidebarLayout
