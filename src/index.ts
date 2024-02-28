import { Scenes, session, Telegraf, Context as TelegrafContext } from 'telegraf'
import scenes from './scenes'
import handlers from './handlers'
import prisma from './utils/prisma'
import { Profile, User } from '@prisma/client'

export interface Context extends TelegrafContext {
    user: User | null
    profile: Profile | null
    scene: Scenes.SceneContextScene<Context, Scenes.WizardSessionData>
    wizard: Scenes.WizardContextWizard<Context>
}

const bot = new Telegraf<Context>(process.env.BOT_TOKEN || '')
const stage = new Scenes.Stage<Context>([scenes.welcome])
bot.use(session())
bot.use(stage.middleware())
bot.use(async (ctx, next) => {
    if (!ctx.message) return next()
    ctx.user = await prisma.user.findUnique({ where: { id: ctx.message.from.id } })
    ctx.profile = ctx.user ? await prisma.profile.findUnique({ where: { userId: ctx.user.id } }) : null
    return next()
})

bot.start(handlers.start)
bot.hears('Profile', handlers.profile)

bot.launch()
