import { prisma } from "@/lib/prisma"
import { MaterialsTable } from "@/components/admin/materials/materials-table"
import { MaterialsFilters } from "@/components/admin/materials/materials-filters"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { MaterialType } from "@prisma/client"

export default async function MaterialsPage({
    searchParams,
}: {
    searchParams: Promise<{ nom?: string; type?: string; fournisseur?: string }>
}) {
    const params = await searchParams
    const where: any = {}
    
    if (params.nom) {
        where.name = { contains: params.nom, mode: "insensitive" }
    }
    if (params.type) {
        where.type = params.type as MaterialType
    }
    if (params.fournisseur) {
        where.supplier = { contains: params.fournisseur, mode: "insensitive" }
    }

    const materials = await prisma.material.findMany({
        where,
        orderBy: { createdAt: "desc" },
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Matières premières</h1>
                    <p className="text-muted-foreground mt-1">
                        Gérez vos matières premières et leurs coûts
                    </p>
                </div>
                <Button asChild>
                    <Link href="/bo/matieres/nouveau">
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter une matière
                    </Link>
                </Button>
            </div>

            <MaterialsFilters />
            <MaterialsTable materials={materials} />
        </div>
    )
}
