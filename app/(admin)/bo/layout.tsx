import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { Sidebar } from "@/components/admin/sidebar"
import { Header } from "@/components/admin/header"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session) {
        redirect("/login")
    }

    return (
        <div className="flex h-screen bg-stone-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header user={session.user} />
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
