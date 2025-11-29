"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Package,
    Flame,
    Euro,
    TrendingUp,
    Settings,
} from "lucide-react"

const navigation = [
    { name: "Dashboard", href: "/bo", icon: LayoutDashboard },
    { name: "Matières premières", href: "/bo/matieres", icon: Package },
    { name: "Bougies", href: "/bo/bougies", icon: Flame },
    { name: "Prix & Marges", href: "/bo/prix", icon: Euro },
    { name: "Projections", href: "/bo/projections", icon: TrendingUp },
    { name: "Paramètres", href: "/bo/parametres", icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="w-64 bg-stone-900 text-stone-100 flex flex-col">
            <div className="p-6">
                <h1 className="text-xl font-light tracking-wide">Medicandle</h1>
                <p className="text-xs text-stone-400 mt-1">Back Office</p>
            </div>

            <nav className="flex-1 px-3 space-y-1">
                {navigation.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-stone-800 text-white"
                                    : "text-stone-300 hover:bg-stone-800 hover:text-white"
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
