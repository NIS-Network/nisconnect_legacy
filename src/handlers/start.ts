import { Context } from '..'
import keyboards from '../keyboards'

export default async (ctx: Context) => {
    if (!ctx.user) return await ctx.scene.enter('welcome')
    return await ctx.reply(`Welcome`, keyboards.main(ctx.user.language, ctx.user.status))
}
