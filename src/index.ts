import { Scenes, session, Telegraf, Context as TelegrafContext } from 'telegraf'
import scenes from './scenes'
import handlers from './handlers'
import { Profile, User } from '@prisma/client'
import { i18n } from './utils/i18n'
import middlewares from './middlewares'
import { message } from 'telegraf/filters'
import prisma from './utils/prisma'
import usersOnly from './handlers/usersOnly'
import keyboards from './keyboards'

export interface Context extends TelegrafContext {
    user: User | null
    profile: Profile | null
    scene: Scenes.SceneContextScene<Context, Scenes.WizardSessionData>
    wizard: Scenes.WizardContextWizard<Context>
}

const bot = new Telegraf<Context>(process.env.BOT_TOKEN || '')
const stage = new Scenes.Stage<Context>([scenes.welcome, scenes.changeLanguage, scenes.deleteUser])
bot.use(session())
bot.use(middlewares.checkAuth)
bot.use(stage.middleware())

bot.start(handlers.start)
bot.hears(
    i18n.localesList.map((locale) => i18n.t(locale, 'button:profile')),
    handlers.usersOnly,
    handlers.profile,
)
bot.hears(
    i18n.localesList.map((locale) => i18n.t(locale, 'button:settings')),
    handlers.usersOnly,
    handlers.settings,
)
bot.hears(
    i18n.localesList.map((locale) => i18n.t(locale, 'button:searchPartner')),
    handlers.usersOnly,
    handlers.searchPartner,
)
bot.hears(
    i18n.localesList.map((locale) => i18n.t(locale, 'button:leavePartner')),
    handlers.usersOnly,
    async (ctx) => {
        if (!ctx.user || !ctx.profile || ctx.user.status != 'chatting' || !ctx.user.partner) return
        const partner = await prisma.user.findUnique({ where: { id: ctx.user.partner } })
        if (!partner) {
            await prisma.user.update({ where: { id: ctx.user.id }, data: { status: 'default', partner: null } })
            return
        }
        await prisma.user.update({ where: { id: partner.id }, data: { status: 'default', partner: null } }).catch(console.log)
        await prisma.user.update({ where: { id: ctx.user.id }, data: { status: 'default', partner: null } }).catch(console.log)
        await ctx.telegram.sendMessage(Number(partner.id), 'Your partner have disconnected', { reply_markup: keyboards.main(partner.language, 'default').reply_markup })
        await ctx.reply('You have disconnected', keyboards.main(ctx.user.language, 'default'))
    },
)
bot.hears(
    i18n.localesList.map((locale) => i18n.t(locale, 'button:stopSearching')),
    usersOnly,
    async (ctx) => {
        if (!ctx.user || !ctx.profile || ctx.user.status != 'searching' || ctx.user.partner) return
        await prisma.queue.delete({ where: { user: ctx.user.id } }).catch(console.log)
        await prisma.user.update({ where: { id: ctx.user.id }, data: { status: 'default' } }).catch(console.log)
        await ctx.reply('You have stoped searching for a partner', keyboards.main(ctx.user.language, 'default'))
    },
)
bot.action('changeLanguage', handlers.usersOnly, async (ctx) => await ctx.scene.enter('changeLanguage'))
bot.action('deleteUser', handlers.usersOnly, async (ctx) => await ctx.scene.enter('deleteUser'))
bot.on(message('text'), async (ctx) => {
    if (ctx.user && ctx.profile && ctx.user.status == 'chatting' && ctx.user.partner) {
        await ctx.telegram.sendMessage(Number(ctx.user.partner), ctx.message.text)
    }
})

bot.launch()
