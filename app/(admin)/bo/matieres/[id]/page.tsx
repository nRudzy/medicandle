import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { MaterialForm } from "@/components/admin/materials/material-form"

export default async function EditMaterialPage({
    params,
}: {
    params: { id: string }
}) {
    const material = await prisma.material.findUnique({
        where: { id: params.id },
    })

    if (!material) {
        notFound()
    }

    return (
        <div className="max-w-2xl space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Modifier la matière première</h1>
                <p className="text-muted-foreground mt-1">
                    Modifiez les informations de {material.name}
                </p>
            </div>

            <MaterialForm material={material} />
        </div>
    )
}
