import { callbackQuery } from 'telegraf/filters'
import { Context } from '..'
import keyboards from '../keyboards'
import i18n from '../utils/i18n'

export default async (ctx: Context) => {
    if (!ctx.has(callbackQuery('data'))) return
    const reciever = Number(ctx.callbackQuery.data.split('_')[1])
    await ctx.scene.enter('chitChat', {
        reciever,
        cancelFC: () => {},
        returnFC: async (ctx: Context) => {
            await ctx.reply(i18n.t(ctx.session.user.language, 'message:messageSent'), keyboards.main(ctx.session.user.language, ctx.session.user.status))
        },
    })
}
