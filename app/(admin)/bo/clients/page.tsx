import { prisma } from "@/lib/prisma"
import { ClientsTable } from "@/components/admin/clients/clients-table"
import { ClientsFilters } from "@/components/admin/clients/clients-filters"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { ClientType } from "@prisma/client"

export default async function ClientsPage({
    searchParams,
}: {
    searchParams: Promise<{ typeClient?: string; nom?: string; email?: string; ville?: string }>
}) {
    const params = await searchParams
    const whereConditions: any[] = []
    
    if (params.typeClient) {
        whereConditions.push({ typeClient: params.typeClient as ClientType })
    }
    if (params.nom) {
        whereConditions.push({
            OR: [
                { nom: { contains: params.nom, mode: "insensitive" } },
                { prenom: { contains: params.nom, mode: "insensitive" } },
                { raisonSociale: { contains: params.nom, mode: "insensitive" } },
            ]
        })
    }
    if (params.email) {
        whereConditions.push({ email: { contains: params.email, mode: "insensitive" } })
    }
    if (params.ville) {
        whereConditions.push({ ville: { contains: params.ville, mode: "insensitive" } })
    }

    const where = whereConditions.length > 0 ? { AND: whereConditions } : {}

    const clients = await prisma.client.findMany({
        where,
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

            <ClientsFilters />
            <ClientsTable clients={clients} />
        </div>
    )
}

