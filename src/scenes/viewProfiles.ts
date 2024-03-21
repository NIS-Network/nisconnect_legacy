import { Scenes } from 'telegraf'
import { Context } from '..'
import { Profile } from '@prisma/client'
import prisma from '../utils/prisma'
import i18n from '../utils/i18n'
import keyboards from '../keyboards'
import capitalizeFirst from '../utils/capitalizeFirst'

export interface viewProfilesState {
    profiles: Profile[]
}

async function show(ctx: Context) {
    if (ctx.session.viewProfilesState.profiles.length <= 0) {
        await ctx.reply(i18n.t(ctx.session.user.language, 'message:unseenProfiles', { profiles: 0 }), keyboards.main(ctx.session.user.language, ctx.session.user.status))
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
    await ctx.telegram.sendMessage(Number(user.id), i18n.t(user.language, `message:likedYou${capitalizeFirst(profile.genderPreference)}`, { liked: user.liked.length + 1 }), {
        reply_markup: keyboards.viewLiked.reply_markup,
    })
    await show(ctx)
})
scene.hears('👎', show)
scene.hears('💌', async (ctx) => {
    ctx.scene.enter('chitChat', {
        reciever: ctx.session.user.seen[ctx.session.user.seen.length - 1],
        cancelFC: async (ctx: Context) => await ctx.scene.enter('viewProfiles'),
        returnFC: async (ctx: Context) => {
            await ctx.reply(i18n.t(ctx.session.user.language, 'message:messageSent'))
            await ctx.scene.enter('viewProfiles')
        },
    })
})
scene.hears('💤', async (ctx) => {
    await ctx.reply(i18n.t(ctx.session.user.language, 'message:stopedViewingProfiles'), keyboards.main(ctx.session.user.language, ctx.session.user.status))
    await ctx.scene.leave()
})

export default scene
