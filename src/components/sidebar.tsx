"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BeakerIcon,
  BoxesIcon,
  FlaskConicalIcon,
  HomeIcon,
  LayoutDashboardIcon,
  RotateCcwIcon,
  WarehouseIcon
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}

export default function Sidebar() {
  const pathname = usePathname()
  
  const navItems: NavItem[] = [
    {
      title: "Panel de Control",
      href: "/dashboard",
      icon: <LayoutDashboardIcon className="h-5 w-5" />,
    },
    {
      title: "Productos",
      href: "/products",
      icon: <BeakerIcon className="h-5 w-5" />,
    },
    {
      title: "Laboratorios",
      href: "/suppliers",
      icon: <FlaskConicalIcon className="h-5 w-5" />,
    },
    {
      title: "Almacenes",
      href: "/warehouses",
      icon: <WarehouseIcon className="h-5 w-5" />,
    },
    {
      title: "Inventario",
      href: "/inventory",
      icon: <BoxesIcon className="h-5 w-5" />,
    },
    {
      title: "Existencias",
      href: "/stock",
      icon: <RotateCcwIcon className="h-5 w-5" />,
    },
  ]

  return (
    <aside className="bg-muted/40 w-64 border-r border-border flex flex-col h-full">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2 mb-8">
          <BeakerIcon className="h-8 w-8 text-primary" />
          <span className="font-semibold text-lg">Inventario Laboratorio</span>
        </Link>
        
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-primary/10"
              )}
            >
              {item.icon}
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
}
