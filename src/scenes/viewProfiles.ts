import { Scenes } from 'telegraf'
import { Context } from '..'
import { Profile } from '@prisma/client'
import prisma from '../utils/prisma'
import { i18n } from '../utils/i18n'
import keyboards from '../keyboards'

export interface viewProfilesState {
    profiles: Profile[]
}

async function show(ctx: Context) {
    if (ctx.session.viewProfilesState.profiles.length <= 0) {
        await ctx.reply('0 unseen profiles left', keyboards.main(ctx.session.user.language, ctx.session.user.status))
        return await ctx.scene.leave()
    }
    const profile = ctx.session.viewProfilesState.profiles[0]
    if (ctx.session.user.liked.includes(profile.id)) {
        ctx.session.user = await prisma.user.update({ where: { id: ctx.session.user.id }, data: { liked: { set: ctx.session.user.liked.filter((id) => id != profile.id) } } })
    }
    ctx.session.viewProfilesState.profiles = ctx.session.viewProfilesState.profiles.slice(1, -1)
    ctx.session.user = await prisma.user.update({ where: { id: ctx.session.user.id }, data: { seen: { push: profile.id } } })
    const user = await prisma.user.findUnique({ where: { id: profile.userId } })
    if (!user) return
    await ctx.replyWithPhoto(profile.photoId, {
        caption: `${profile.name}, ${profile.age}, ${i18n.t(ctx.session.user.language, user.city)} - ${profile.bio}`,
        reply_markup: keyboards.viewProfile.reply_markup,
    })
}

const scene = new Scenes.BaseScene<Context>('viewProfiles')
scene.enter(show)
scene.hears('❤️', async (ctx) => {
    const profile = await prisma.profile.findUnique({ where: { id: ctx.session.user.seen[ctx.session.user.seen.length - 1] } })
    const user = await prisma.user.findUnique({ where: { id: profile?.userId } })
    if (!user || !profile) return
    await prisma.user.update({ where: { id: user.id }, data: { liked: { push: ctx.session.profile.id } } })
    await ctx.telegram.sendMessage(Number(user.id), `${user.liked.length + 1} ${i18n.t(user.language, 'genderPreference:' + profile.genderPreference)} liked you\n1. Show\n2. Disable my profile`, {
        reply_markup: keyboards.viewLiked.reply_markup,
    })
    await show(ctx)
})
scene.hears('👎', show)
scene.hears('💌', async (ctx) => {
    ctx.scene.enter('chitchat', {
        reciever: ctx.session.user.seen[ctx.session.user.seen.length - 1],
        cancelFC: async (ctx: Context) => await ctx.scene.enter('viewProfiles'),
        returnFC: async (ctx: Context) => {
            console.log(ctx.from)
            await ctx.reply('Your message have been sent')
            await ctx.scene.enter('viewProfiles')
        },
    })
})
scene.hears('💤', async (ctx) => {
    await ctx.reply('Stoped viewing profiles', keyboards.main(ctx.session.user.language, ctx.session.user.status))
    await ctx.scene.leave()
})
scene.use(async (ctx) => {
    console.log(ctx.session.viewProfilesState)
})

export default scene
