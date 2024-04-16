import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient({ errorFormat: 'pretty', log: ['info', 'error'] })
export default prisma
