import { prisma } from "@/lib/prisma"
import { ClientsTable } from "@/components/admin/clients/clients-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function ClientsPage() {
    const clients = await prisma.client.findMany({
        orderBy: { createdAt: "desc" },
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
                    <p className="text-muted-foreground mt-1">
                        Gérez vos clients
                    </p>
                </div>
                <Button asChild>
                    <Link href="/bo/clients/nouveau">
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter un client
                    </Link>
                </Button>
            </div>

            <ClientsTable clients={clients} />
        </div>
    )
}

