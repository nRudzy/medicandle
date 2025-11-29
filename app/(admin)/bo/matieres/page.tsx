import { prisma } from "@/lib/prisma"
import { MaterialsTable } from "@/components/admin/materials/materials-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function MaterialsPage() {
    const materials = await prisma.material.findMany({
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

            <MaterialsTable materials={materials} />
        </div>
    )
}
