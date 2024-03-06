import { Context } from '..'

export default async (ctx: Context, next: () => Promise<void>) => {
    if (ctx.user && ctx.profile) return next()
    return await ctx.reply("you don't have an account")
}
