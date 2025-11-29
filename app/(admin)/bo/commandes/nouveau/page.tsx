import { prisma } from "@/lib/prisma"
import { CommandeFormStepper } from "@/components/admin/commandes/commande-form-stepper"

export default async function NewCommandePage() {
    const clients = await prisma.client.findMany({
        orderBy: { nom: "asc" },
    })

    const candles = await prisma.candle.findMany({
        where: { active: true },
        orderBy: { name: "asc" },
    })

    return (
        <div className="max-w-4xl space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Nouvelle commande</h1>
                <p className="text-muted-foreground mt-1">
                    Créez une nouvelle commande avec ses lignes
                </p>
            </div>

            <CommandeFormStepper clients={clients} candles={candles} />
        </div>
    )
}

