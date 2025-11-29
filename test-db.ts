import { PrismaClient } from '@prisma/client'

console.log('Starting test...')
try {
    const prisma = new PrismaClient()
    console.log('Client instantiated')

    prisma.$connect().then(() => {
        console.log('Connected successfully')
        process.exit(0)
    }).catch((e) => {
        console.error('Connection failed:', e)
        process.exit(1)
    })
} catch (e) {
    console.error('Instantiation failed:', e)
    process.exit(1)
}
