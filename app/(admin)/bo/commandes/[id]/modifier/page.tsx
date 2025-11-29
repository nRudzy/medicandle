import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { CommandeForm } from "@/components/admin/commandes/commande-form"
import { checkCommandeFeasibility } from "@/lib/business/commandes"

export default async function EditCommandePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const commande = await prisma.commande.findUnique({
        where: { id },
    })

    if (!commande) {
        notFound()
    }

    const clients = await prisma.client.findMany({
        orderBy: { nom: "asc" },
    })

    // Calculate feasibility
    let isFeasible: boolean | null = null
    try {
        const feasibility = await checkCommandeFeasibility(id)
        isFeasible = feasibility.isFeasible
    } catch (error) {
        console.error("Error checking feasibility:", error)
        // Keep isFeasible as null if there's an error
    }

    return (
        <div className="max-w-2xl space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Modifier la commande</h1>
                <p className="text-muted-foreground mt-1">
                    Modifiez les informations de {commande.reference}
                </p>
            </div>

            <CommandeForm commande={commande} clients={clients} isFeasible={isFeasible} />
        </div>
    )
}

