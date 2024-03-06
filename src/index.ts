import { Scenes, session, Telegraf, Context as TelegrafContext } from 'telegraf'
import scenes from './scenes'
import handlers from './handlers'
import prisma from './utils/prisma'
import { Profile, User } from '@prisma/client'
import { i18n } from './utils/i18n'

export interface Context extends TelegrafContext {
    user: User | null
    profile: Profile | null
    scene: Scenes.SceneContextScene<Context, Scenes.WizardSessionData>
    wizard: Scenes.WizardContextWizard<Context>
}

const bot = new Telegraf<Context>(process.env.BOT_TOKEN || '')
const stage = new Scenes.Stage<Context>([scenes.welcome, scenes.changeLanguage, scenes.deleteUser])
bot.use(session())
bot.use(async (ctx, next) => {
    if (ctx.message) {
        ctx.user = await prisma.user.findUnique({ where: { id: ctx.message.from.id } })
        ctx.profile = ctx.user ? await prisma.profile.findUnique({ where: { userId: ctx.user.id } }) : null
    }
    if (ctx.callbackQuery) {
        ctx.user = await prisma.user.findUnique({ where: { id: ctx.callbackQuery.from.id } })
        ctx.profile = ctx.user ? await prisma.profile.findUnique({ where: { userId: ctx.user.id } }) : null
    }
    return next()
})
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
bot.action('changeLanguage', handlers.usersOnly, async (ctx) => {
    if (!ctx.user) return
    ctx.scene.enter('changeLanguage')
})
bot.action('deleteUser', handlers.usersOnly, async (ctx) => {
    ctx.scene.enter('deleteUser')
})

bot.launch()
