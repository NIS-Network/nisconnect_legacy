import { Markup } from 'telegraf'
import { InlineKeyboardMarkup, ReplyKeyboardMarkup } from 'telegraf/types'

export function combineKeyboards(a: Markup.Markup<ReplyKeyboardMarkup>, b: Markup.Markup<ReplyKeyboardMarkup>) {
    const combined = [...a.reply_markup.keyboard, ...b.reply_markup.keyboard]
    return Markup.keyboard(combined).resize()
}

export function combineInlineKeyboards(a: Markup.Markup<InlineKeyboardMarkup>, b: Markup.Markup<InlineKeyboardMarkup>) {
    const combined = [...a.reply_markup.inline_keyboard, ...b.reply_markup.inline_keyboard]
    return Markup.inlineKeyboard(combined)
}
