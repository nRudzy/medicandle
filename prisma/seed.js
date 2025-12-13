const { PrismaClient, Role, Unit, MaterialType } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting seed...')

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
    console.log('✅ Admin user created:', admin.email)

    // 2. Create Default Production Settings
    const prodSettings = await prisma.productionSettings.create({
        data: {
            laborRate: 25.0, // 25€/h
            electricityCost: 0.5, // 0.50€ per session/hour estimate
            amortizationCost: 0.2, // 0.20€ per candle
        },
    })
    console.log('✅ Production settings created')

    // 3. Create Default Pricing Settings
    const pricingSettings = await prisma.pricingSettings.create({
        data: {
            targetMargin: 50.0, // 50%
            multiplierEntry: 2.5,
            multiplierPremium: 3.0,
            multiplierLuxury: 4.0,
        },
    })
    console.log('✅ Pricing settings created')

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
            unit: Unit.L,
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

    console.log('✅ Sample materials created:', wax.name, scent.name, wick.name, container.name)
    console.log('\n🎉 Seed completed successfully!')
    console.log('👤 Admin credentials: admin@medicandle.com / admin123')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error('❌ Error during seed:', e)
        await prisma.$disconnect()
        process.exit(1)
    })
