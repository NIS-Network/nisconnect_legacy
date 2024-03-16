import { Context } from '..'

export default async (ctx: Context, next: () => Promise<void>) => {
    if (!ctx.session.authorized) {
        return await ctx.reply("you don't have an account")
    }
    return next()
}
