import { handlers } from "@/auth"

export const { GET, POST } = handlers

// Force Node.js runtime to support crypto module (bcryptjs, prisma)
export const runtime = 'nodejs'
