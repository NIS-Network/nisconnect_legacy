import { Context } from '..'

export default async (ctx: Context) => {
    if (!ctx.profile) return await ctx.reply('You dont have a profile yet')
    await ctx.sendPhoto(ctx.profile.photoId, { caption: `${ctx.profile.name}, ${ctx.profile.age} - ${ctx.profile.bio}` })
}
