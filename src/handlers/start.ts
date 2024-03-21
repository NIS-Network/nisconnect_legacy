import { Context } from '..'
import keyboards from '../keyboards'
import i18n from '../utils/i18n'

export default async (ctx: Context) => {
    if (!ctx.session.authorized) return await ctx.scene.enter('welcome')
    return await ctx.reply(i18n.t(ctx.session.user.language, 'message:start'), keyboards.main(ctx.session.user.language, ctx.session.user.status))
}
