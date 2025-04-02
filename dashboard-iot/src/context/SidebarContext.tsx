"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface SidebarContextType {
    collapsed: boolean
    toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType>({
    collapsed: false,
    toggleSidebar: () => { },
})

export const useSidebar = () => useContext(SidebarContext)

interface SidebarProviderProps {
    children: React.ReactNode
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
    // Intentar recuperar el estado del sidebar del localStorage
    const [collapsed, setCollapsed] = useState(() => {
        const savedState = localStorage.getItem("sidebar-collapsed")
        return savedState ? JSON.parse(savedState) : false
    })

    // Guardar el estado en localStorage cuando cambie
    useEffect(() => {
        localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed))
    }, [collapsed])

    const toggleSidebar = () => {
        setCollapsed(!collapsed)
    }

    return <SidebarContext.Provider value={{ collapsed, toggleSidebar }}>{children}</SidebarContext.Provider>
}

