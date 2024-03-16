import { Context } from '..'
import keyboards from '../keyboards'
import { i18n } from '../utils/i18n'

export default async (ctx: Context) => {
    const locale = ctx.session.user.language
    return await ctx.reply(
        i18n.t(locale, 'message:settings', {
            id: ctx.session.user.login,
            city: i18n.t(locale, ctx.session.user.city),
            gender: i18n.t(locale, `gender:${ctx.session.profile.gender}`),
            genderPreference: i18n.t(locale, `genderPreference:${ctx.session.profile.genderPreference}`),
        }),
        keyboards.settings(locale),
    )
}
