import { Scenes, session, Telegraf, Context as TelegrafContext } from 'telegraf'
import scenes from './scenes'
import { IUser, userStatements } from './database/user'
import handers from './handers'
import { init } from './database'
import { IProfile, profileStatements } from './database/profile'

export interface Context extends TelegrafContext {
    user: IUser | undefined
    profile: IProfile | undefined
    scene: Scenes.SceneContextScene<Context, Scenes.WizardSessionData>
    wizard: Scenes.WizardContextWizard<Context>
}

const bot = new Telegraf<Context>(process.env.BOT_TOKEN || '')
const stage = new Scenes.Stage<Context>([scenes.welcome])
bot.use(session())
bot.use(stage.middleware())
bot.use((ctx, next) => {
    if (!ctx.message) return next()
    const user = Object(userStatements.select.get(ctx.message?.from.id))
    ctx.user = Object.keys(user).length == 0 ? undefined : user
    const profile = Object(profileStatements.select.get(ctx.message?.from.id))
    ctx.profile = Object.keys(profile).length == 0 ? undefined : profile
    return next()
})

bot.start(handers.start)

init()
bot.launch()
