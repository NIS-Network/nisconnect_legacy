import { Context } from '..'
import keyboards from '../keyboards'
import { i18n } from '../utils/i18n'

export default async (ctx: Context) => {
    if (!ctx.user || !ctx.profile) return
    const locale = ctx.user.language
    return await ctx.reply(
        i18n.t(locale, 'message:settings', {
            id: ctx.user.login,
            city: i18n.t(locale, ctx.user.city),
            gender: i18n.t(locale, 'gender:' + ctx.profile.gender),
            genderPreference: i18n.t(locale, 'genderPreference:' + ctx.profile.genderPreference),
        }),
        keyboards.settings(locale),
    )
}
