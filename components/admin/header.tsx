"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User } from "lucide-react"

import { MobileSidebar } from "./mobile-sidebar"

interface HeaderProps {
    user: {
        name?: string | null
        email?: string
    }
}

export function Header({ user }: HeaderProps) {
    const isProduction = process.env.NODE_ENV === "production"
    const envLabel = isProduction ? "PRODUCTION" : "DEVELOPMENT"
    const envClasses = isProduction
        ? "bg-red-100 text-red-700 border border-red-200"
        : "bg-blue-100 text-blue-700 border border-blue-200"

    return (
        <header className="border-b border-[var(--medicandle-beige)] bg-[var(--medicandle-ivory)] px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MobileSidebar />
                    <h2 className="text-sm font-medium text-[var(--medicandle-brown)] hidden md:block">
                        Back Office
                    </h2>
                </div>

                <div className="flex items-center gap-3">
                    <span
                        className={`text-xs font-semibold uppercase tracking-widest px-4 py-1 rounded-full ${envClasses}`}
                    >
                        {envLabel}
                    </span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-2">
                                <User className="h-4 w-4" />
                                {user.name || user.email}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Déconnexion
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
