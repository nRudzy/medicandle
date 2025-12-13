import { PrismaClient, Role, Unit, MaterialType, Positioning } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import 'dotenv/config'

console.log('CWD:', process.cwd())
console.log('DATABASE_URL (env):', process.env.DATABASE_URL)

const prisma = new PrismaClient()

async function main() {
    // 1. Create Admin User
    const passwordHash = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@medicandle.com' },
        update: {},
        create: {
            email: 'admin@medicandle.com',
            passwordHash,
            role: Role.ADMIN,
            name: 'Admin',
        },
    })
    console.log({ admin })

    // 2. Create Default Production Settings
    const prodSettings = await prisma.productionSettings.create({
        data: {
            laborRate: 25.0, // 25€/h
            electricityCost: 0.5, // 0.50€ per session/hour estimate
            amortizationCost: 0.2, // 0.20€ per candle
        },
    })
    console.log({ prodSettings })

    // 3. Create Default Pricing Settings
    const pricingSettings = await prisma.pricingSettings.create({
        data: {
            targetMargin: 50.0, // 50%
            multiplierEntry: 2.5,
            multiplierPremium: 3.0,
            multiplierLuxury: 4.0,
        },
    })
    console.log({ pricingSettings })

    // 4. Create some sample Materials
    const wax = await prisma.material.create({
        data: {
            name: 'Cire de Soja Bio',
            type: MaterialType.WAX,
            costPerUnit: 12.50, // 12.50€
            unit: Unit.KG,
            supplier: 'Fournisseur Bio',
            stockPhysique: 10.0,
        },
    })

    const scent = await prisma.material.create({
        data: {
            name: 'Fragrance Bois de Santal',
            type: MaterialType.SCENT,
            costPerUnit: 45.00, // 45€
            unit: Unit.L, // or ML? Let's say L for bulk buy
            supplier: 'Grasse Parfums',
            stockPhysique: 1.0,
        },
    })

    const wick = await prisma.material.create({
        data: {
            name: 'Mèche Coton T3',
            type: MaterialType.WICK,
            costPerUnit: 0.15, // 0.15€ per piece
            unit: Unit.PIECE,
            supplier: 'WickMaster',
            stockPhysique: 500,
        },
    })

    const container = await prisma.material.create({
        data: {
            name: 'Pot Verre Ambré 180ml',
            type: MaterialType.CONTAINER,
            costPerUnit: 1.20, // 1.20€
            unit: Unit.PIECE,
            supplier: 'GlassCo',
            stockPhysique: 200,
        },
    })

    console.log({ wax, scent, wick, container })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
