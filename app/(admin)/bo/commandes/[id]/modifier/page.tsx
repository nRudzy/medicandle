import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { CommandeForm } from "@/components/admin/commandes/commande-form"

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

    return (
        <div className="max-w-2xl space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Modifier la commande</h1>
                <p className="text-muted-foreground mt-1">
                    Modifiez les informations de {commande.reference}
                </p>
            </div>

            <CommandeForm commande={commande} clients={clients} />
        </div>
    )
}

