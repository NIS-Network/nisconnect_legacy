import { Context } from '..'
import i18n from '../utils/i18n'

export default async (ctx: Context, next: () => Promise<void>) => {
    if (!ctx.session.authorized) {
        return await ctx.reply(i18n.t('message:notAuthorized') + '\n\nTry to enter /start, if you think it is an error, or contact @infxyz')
    }
    return next()
}
