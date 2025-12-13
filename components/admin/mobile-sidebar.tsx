"use client"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { Sidebar } from "./sidebar"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

export function MobileSidebar() {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()

    // Close sidebar on route change
    useEffect(() => {
        setOpen(false)
    }, [pathname])

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-[var(--medicandle-brown)]">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-[var(--medicandle-brown)] border-none w-72">
                <Sidebar className="w-full h-full" />
            </SheetContent>
        </Sheet>
    )
}
