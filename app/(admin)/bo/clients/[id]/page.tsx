import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ClientForm } from "@/components/admin/clients/client-form"

export default async function EditClientPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const client = await prisma.client.findUnique({
        where: { id },
    })

    if (!client) {
        notFound()
    }

    return (
        <div className="max-w-2xl space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Modifier le client</h1>
                <p className="text-muted-foreground mt-1">
                    Modifiez les informations de {client.nom}
                </p>
            </div>

            <ClientForm client={client} />
        </div>
    )
}

