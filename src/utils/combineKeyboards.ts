import { Markup } from 'telegraf'
import { InlineKeyboardButton, InlineKeyboardMarkup, KeyboardButton, ReplyKeyboardMarkup } from 'telegraf/types'

export function combineKeyboards(...arr: Markup.Markup<ReplyKeyboardMarkup>[]): Markup.Markup<ReplyKeyboardMarkup> {
    const combined: KeyboardButton[][] = []
    for (const i of arr) {
        combined.push(...i.reply_markup.keyboard)
    }
    return Markup.keyboard(combined).resize()
}

export function combineInlineKeyboards(...arr: Markup.Markup<InlineKeyboardMarkup>[]): Markup.Markup<InlineKeyboardMarkup> {
    const combined: InlineKeyboardButton[][] = []
    for (const i of arr) {
        combined.push(...i.reply_markup.inline_keyboard)
    }
    return Markup.inlineKeyboard(combined)
}
