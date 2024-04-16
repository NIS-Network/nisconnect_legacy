import { Composer, Scenes } from 'telegraf'
import { Context } from '..'
import keyboards from '../keyboards'
import { combineInlineKeyboards } from '../utils/combineKeyboards'
import { message } from 'telegraf/filters'
import i18n from '../utils/i18n'
import prisma from '../utils/prisma'
import { ReportDTO } from '../handlers/report'

const cancel = async (ctx: Context, next: () => Promise<void>) => {
    if (ctx.has(message('text')) && ctx.message.text == i18n.t(ctx.session.user.language, 'button:cancel')) {
        await ctx.reply(i18n.t(ctx.session.user.language, 'message:canceled'), keyboards.main(ctx.session.user.language, ctx.session.user.status))
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
        return await ctx.reply(i18n.t(ctx.session.user.language, 'message:tooShort'))
    }
    // @ts-expect-error unsolved telegraf issue
    const profile = await prisma.profile.findUnique({ where: { id: ctx.wizard.state.reciever } })
    const user = await prisma.user.findUnique({ where: { id: profile?.userId } })
    if (!profile || !user) {
        await ctx.scene.leave()
        // @ts-expect-error unsolved telegraf issue
        return await ctx.wizard.state.cancelFC(ctx)
    }
    // const report: ReportDTO = {
    //     victim: profile.id,
    //     intruder: ctx.session.profile.id,
    //     type: 'chitChat',
    //     message,
    // }
    await ctx.telegram.sendMessage(Number(profile.userId), i18n.t(user.language, 'message:responded', { name: ctx.session.profile.name, message }), {
        reply_markup: combineInlineKeyboards(keyboards.respond(user.language, Number(ctx.session.profile.id))).reply_markup,
    })
    await ctx.scene.leave()
    // @ts-expect-error unsolved telegraf issue
    return await ctx.wizard.state.returnFC(ctx)
})

export default new Scenes.WizardScene<Context>(
    'chitChat',
    async (ctx) => {
        await ctx.reply(i18n.t(ctx.session.user.language, 'message:enterShortText'), keyboards.cancel(ctx.session.user.language))
        ctx.wizard.next()
    },
    messageHandler,
)
