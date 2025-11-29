"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Package,
    Flame,
    Euro,
    TrendingUp,
    Settings,
    ShoppingCart,
    Users,
    FileText,
} from "lucide-react"

const navigation = [
    { name: "Dashboard", href: "/bo", icon: LayoutDashboard },
    { name: "Matières premières", href: "/bo/matieres", icon: Package },
    { name: "Bougies", href: "/bo/bougies", icon: Flame },
    { name: "Clients", href: "/bo/clients", icon: Users },
    { name: "Commandes", href: "/bo/commandes", icon: ShoppingCart },
    { name: "Bons de commande", href: "/bo/bons-de-commande", icon: FileText },
    // { name: "Prix & Marges", href: "/bo/prix", icon: Euro },
    { name: "Projections", href: "/bo/projections", icon: TrendingUp },
    { name: "Paramètres", href: "/bo/parametres", icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="w-64 bg-[var(--medicandle-brown)] text-[var(--medicandle-ivory)] flex flex-col">
            <div className="p-6 flex flex-row items-center justify-center">
                <Link href="/bo" className="flex items-center gap-3 mb-2">
                    <Image
                        src="/branding/medicandle_logo_no_bg.png"
                        alt="Medicandle"
                        width={40}
                        height={40}
                        className="object-contain"
                        priority
                    />
                </Link>
                <h1 className="text-xl font-light tracking-wide font-bold">Medicandle</h1>
            </div>

            <nav className="flex-1 px-3 space-y-1">
                {navigation.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href

                    const isActiveRoute = pathname === item.href || pathname?.startsWith(item.href + "/")

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                isActiveRoute
                                    ? "bg-[var(--medicandle-sage)]/20 text-[var(--medicandle-ivory)]"
                                    : "text-[var(--medicandle-beige)] hover:bg-[var(--medicandle-sage)]/10 hover:text-[var(--medicandle-ivory)]"
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
