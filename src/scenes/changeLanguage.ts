import { Composer, Scenes } from 'telegraf'
import { Context } from '..'
import { i18n } from '../utils/i18n'
import { message } from 'telegraf/filters'
import keyboards, { languagesList } from '../keyboards'
import prisma from '../utils/prisma'
import { combineKeyboards } from '../utils/combineKeyboards'

const cancel = async (ctx: Context, next: () => Promise<void>) => {
    if (ctx.has(message('text'))) {
        if (ctx.message.text == i18n.t(ctx.session.user.language, 'button:cancel') || ctx.message.text == '/cancel') {
            await ctx.reply(i18n.t(ctx.session.user.language, 'message:canceled'), keyboards.main(ctx.session.user.language))
            return await ctx.scene.leave()
        }
    }
    return next()
}

const languageHandler = new Composer<Context>()
languageHandler.use(cancel)
languageHandler.on(message('text'), async (ctx) => {
    const language = ctx.message.text
    let locale = ''
    for (const i in languagesList) {
        if (languagesList[i] == language) {
            locale = i
            break
        }
    }
    if (locale == '') return await ctx.reply(i18n.t('message:language'), combineKeyboards(keyboards.languages, keyboards.cancel(ctx.session.user.language)))
    ctx.session.user = await prisma.user.update({
        where: { id: ctx.message.from.id },
        data: {
            language: locale,
        },
    })
    await ctx.reply(i18n.t(locale, 'message:saved'), keyboards.main(locale))
    return await ctx.scene.leave()
})

export default new Scenes.WizardScene<Context>(
    'changeLanguage',
    async (ctx) => {
        await ctx.reply(i18n.t('message:language'), combineKeyboards(keyboards.languages, keyboards.cancel(ctx.session.user.language)))
        return ctx.wizard.next()
    },
    languageHandler,
)
