import { Context } from '..'
import keyboards from '../keyboards'

export default async (ctx: Context) => {
    if (!ctx.session.authorized) return await ctx.scene.enter('welcome')
    return await ctx.reply('Welcome', keyboards.main(ctx.session.user.language, ctx.session.user.status))
}
