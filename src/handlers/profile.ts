import { Context } from '..'

export default async (ctx: Context) => {
    await ctx.sendPhoto(ctx.session.profile.photoId, { caption: `${ctx.session.profile.name}, ${ctx.session.profile.age} - ${ctx.session.profile.bio}` })
}
