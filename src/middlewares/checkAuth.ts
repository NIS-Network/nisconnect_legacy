import { Context } from '..'
import prisma from '../utils/prisma'

export default async (ctx: Context, next: () => Promise<void>) => {
    if (ctx.message) {
        ctx.user = await prisma.user.findUnique({ where: { id: ctx.message.from.id } })
        ctx.profile = ctx.user ? await prisma.profile.findUnique({ where: { userId: ctx.user.id } }) : null
    }
    if (ctx.callbackQuery) {
        ctx.user = await prisma.user.findUnique({ where: { id: ctx.callbackQuery.from.id } })
        ctx.profile = ctx.user ? await prisma.profile.findUnique({ where: { userId: ctx.user.id } }) : null
    }
    return next()
}
