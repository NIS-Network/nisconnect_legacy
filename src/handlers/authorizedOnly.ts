import { Context } from '..'
import i18n from '../utils/i18n'

export default async (ctx: Context, next: () => Promise<void>) => {
    if (!ctx.session.authorized) {
        return await ctx.reply(i18n.t('message:notAuthorized'))
    }
    return next()
}
