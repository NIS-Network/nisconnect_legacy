import { callbackQuery } from 'telegraf/filters'
import { Context } from '..'
import keyboards from '../keyboards'

export default async (ctx: Context) => {
    if (!ctx.has(callbackQuery('data'))) return
    const reciever = Number(ctx.callbackQuery.data.split('_')[1])
    await ctx.scene.enter('chitchat', {
        reciever,
        cancelFC: async (ctx: Context) => {
            await ctx.reply('Canceled nkjjnkwef', keyboards.main(ctx.session.user.language, ctx.session.user.status))
        },
        returnFC: async (ctx: Context) => {
            await ctx.reply('Your response have been sent', keyboards.main(ctx.session.user.language, ctx.session.user.status))
        },
    })
}
