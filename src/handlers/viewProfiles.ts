import { Context } from '..'
import prisma from '../utils/prisma'

export default async (ctx: Context) => {
    ctx.session.viewProfilesState.profiles = await prisma.profile.findMany({
        where: {
            genderPreference: {
                in: ['all', ctx.session.profile.gender],
            },
            gender: ctx.session.profile.genderPreference == 'all' ? undefined : ctx.session.profile.genderPreference,
            id: {
                notIn: ctx.session.user.seen,
                not: ctx.session.profile.id,
            },
            user: {
                disabled: false,
            },
        },
    })
    await ctx.scene.enter('viewProfiles')
}
