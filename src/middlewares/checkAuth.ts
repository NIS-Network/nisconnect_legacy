import { Context } from '..'
import prisma from '../utils/prisma'

export default async (ctx: Context, next: () => Promise<void>) => {
    const user = await prisma.user.findUnique({ where: { id: ctx.from?.id } })
    const profile = await prisma.profile.findUnique({ where: { userId: ctx.from?.id } })
    if (user && profile) {
        ctx.session.user = user
        ctx.session.profile = profile
        ctx.session.authorized = true
    }
    if (ctx.session.authorized && !ctx.session.viewProfilesState) {
        ctx.session.viewProfilesState = { profiles: [] }
    }
    return next()
}
