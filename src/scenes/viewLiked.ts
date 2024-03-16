import { Scenes } from 'telegraf'
import { Context } from '..'
import prisma from '../utils/prisma'
import { i18n } from '../utils/i18n'
import keyboards from '../keyboards'

async function show(ctx: Context) {
    if (ctx.session.viewProfilesState.profiles.length <= 0) {
        await ctx.reply('You have finished viewing all the profiles that liked you', keyboards.main(ctx.session.user.language, ctx.session.user.status))
        return await ctx.scene.leave()
    }
    const profile = ctx.session.viewProfilesState.profiles[0]
    ctx.session.viewProfilesState.profiles = ctx.session.viewProfilesState.profiles.slice(1, -1)
    ctx.session.user = await prisma.user.update({ where: { id: ctx.session.user.id }, data: { seen: { push: profile.id }, liked: { set: ctx.session.user.liked.filter((id) => id != profile.id) } } })
    const user = await prisma.user.findUnique({ where: { id: profile.userId } })
    if (!user) return
    await ctx.replyWithPhoto(profile.photoId, {
        caption: `${profile.name}, ${profile.age}, ${i18n.t(ctx.session.user.language, user.city)} - ${profile.bio}`,
        reply_markup: keyboards.viewLikedProfile.reply_markup,
    })
}

const scene = new Scenes.BaseScene<Context>('viewLiked')
scene.enter(show)
scene.hears('❤️', async (ctx) => {
    const profile = await prisma.profile.findUnique({ where: { id: ctx.session.user.seen[ctx.session.user.seen.length - 1] } })
    const user = await prisma.user.findUnique({ where: { id: profile?.userId } })
    if (!user || !profile) return
    const tgUser = await ctx.telegram.getChat(Number(user.id))
    await ctx.replyWithHTML(`New friend -> <a href="tg://resolve?domain=${tgUser.type == 'private' && tgUser.username}">${profile.name}</a>`, keyboards.report)
    await ctx.telegram.sendMessage(Number(user.id), `New friend -> <a href="tg://resolve?domain=${ctx.message.from.username}">${ctx.session.profile.name}</a>`, {
        reply_markup: keyboards.report.reply_markup,
        parse_mode: 'HTML',
    })
    await show(ctx)
})
scene.hears('💌', async (ctx) => {
    ctx.scene.enter('chitchat', {
        reciever: ctx.session.user.seen[ctx.session.user.seen.length - 1],
        cancelFC: async (ctx: Context) => await ctx.scene.enter('viewLiked'),
        returnFC: async (ctx: Context) => {
            console.log(ctx.from)
            await ctx.reply('Your message have been sent')
            await ctx.scene.enter('viewLiked')
        },
    })
})
scene.hears('👎', show)
scene.use(async (ctx) => {
    console.log(ctx.session.viewProfilesState)
})

export default scene
