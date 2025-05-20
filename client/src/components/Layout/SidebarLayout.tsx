import React, { useState } from "react"
import { Outlet } from "react-router-dom"
import Header from "../Header/header"
import { cn } from "../../lib/utils"

const SidebarLayout = () => {
  return (
    <div className="min-h-screen flex flex-col font-cal-sans bg-gray-50">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

export default SidebarLayout
