import { Context } from '..'
import keyboards from '../keyboards'

export default async (ctx: Context) => {
    if (!ctx.user) return ctx.scene.enter('welcome')
    await ctx.reply(`Welcome`, keyboards.main)
}
