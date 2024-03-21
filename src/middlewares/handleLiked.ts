import { message } from 'telegraf/filters'
import { Context } from '..'
import prisma from '../utils/prisma'
import keyboards from '../keyboards'
import i18n from '../utils/i18n'

export default async (ctx: Context, next: () => Promise<void>) => {
    if (!ctx.session.authorized) return next()
    if (ctx.session.user.liked.length == 0 || ctx.scene.current) return next()
    if (ctx.has(message('text'))) {
        if (ctx.message.text == '1. ❤️') {
            ctx.session.viewProfilesState.profiles = []
            for (const id of ctx.session.user.liked) {
                const profile = await prisma.profile.findUnique({ where: { id } })
                if (!profile) continue
                ctx.session.viewProfilesState.profiles.push(profile)
            }
            await ctx.scene.enter('viewLiked')
        } else if (ctx.message.text == '2. ❌') {
            ctx.session.user = await prisma.user.update({ where: { id: ctx.session.user.id }, data: { disabled: true, liked: [] } })
            await ctx.reply(i18n.t(ctx.session.user.language, 'message:accountDisabled'), keyboards.main(ctx.session.user.language))
        }
    }
}
