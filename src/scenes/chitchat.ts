import { Composer, Scenes } from 'telegraf'
import { Context } from '..'
import keyboards from '../keyboards'
import { combineInlineKeyboards } from '../utils/combineKeyboards'
import { message } from 'telegraf/filters'
import { i18n } from '../utils/i18n'
import prisma from '../utils/prisma'

const cancel = async (ctx: Context, next: () => Promise<void>) => {
    // @ts-expect-error unsolved telegraf issue
    if (ctx.has(message('text')) && ctx.message.text == i18n.t(ctx.scene.state.language, 'button:cancel')) {
        // @ts-expect-error unsolved telegraf issue
        await ctx.reply(i18n.t(ctx.scene.state.language, 'message:canceled'))
        await ctx.scene.leave()
        // @ts-expect-error unsolved telegraf issue
        return await ctx.wizard.state.cancelFC(ctx)
    }
    return next()
}

const messageHandler = new Composer<Context>()
messageHandler.use(cancel)
messageHandler.on(message('text'), async (ctx) => {
    const message = ctx.message.text
    if (message.length < 3) {
        return await ctx.reply('Your message is too short, try again')
    }
    // @ts-expect-error unsolved telegraf issue
    const profile = await prisma.profile.findUnique({ where: { id: ctx.wizard.state.reciever } })
    if (!profile) {
        await ctx.scene.leave()
        // @ts-expect-error unsolved telegraf issue
        return await ctx.wizard.state.cancelFC(ctx)
    }
    await ctx.telegram.sendMessage(Number(profile.userId), `${ctx.session.profile.name} has a message for you\n\n${message}`, {
        reply_markup: combineInlineKeyboards(keyboards.report, keyboards.respond(Number(ctx.session.profile.id))).reply_markup,
    })
    await ctx.scene.leave()
    // @ts-expect-error unsolved telegraf issue
    return await ctx.wizard.state.returnFC(ctx)
})

export default new Scenes.WizardScene<Context>(
    'chitchat',
    async (ctx) => {
        await ctx.reply('Enter a short text message:', keyboards.cancel(ctx.session.user.language))
        ctx.wizard.next()
    },
    messageHandler,
)
