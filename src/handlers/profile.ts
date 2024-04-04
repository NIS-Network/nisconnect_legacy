import { Context } from '..'
import i18n from '../utils/i18n'

export default async (ctx: Context) => {
    await ctx.sendPhoto(ctx.session.profile.photoId, {
        caption:
            i18n.t(ctx.session.user.language, 'message:profile', { name: ctx.session.profile.name, age: ctx.session.profile.age, bio: ctx.session.profile.bio }) +
            `\n[BETA] userId: ${ctx.session.user.id}\n[BETA] profileId: ${ctx.session.profile.id}`,
    })
}
