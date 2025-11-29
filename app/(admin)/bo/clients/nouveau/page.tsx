import { prisma } from "@/lib/prisma"
import { ClientForm } from "@/components/admin/clients/client-form"

export default async function NewClientPage() {
    return (
        <div className="max-w-2xl space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Nouveau client</h1>
                <p className="text-muted-foreground mt-1">
                    Ajoutez un nouveau client à votre base de données
                </p>
            </div>

            <ClientForm />
        </div>
    )
}

