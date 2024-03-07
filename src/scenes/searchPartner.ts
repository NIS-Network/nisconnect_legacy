import { Scenes } from 'telegraf'
import { Context } from '..'

export default new Scenes.WizardScene<Context>('searchPartner', async (ctx) => {
    console.log(ctx)
})
