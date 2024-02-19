import { Context } from '..'

export default async (ctx: Context) => {
    if (!ctx.user) return ctx.scene.enter('welcome')
    await ctx.reply(`Welcome`)
}
