import { Markup } from 'telegraf'

const empty = Markup.removeKeyboard()

const languages = Markup.keyboard([['🇰🇿 Қазақ', '🇬🇧 English', '🇷🇺 Русский']]).resize()
const cancel = Markup.keyboard([['Cancel']]).resize()
const gender = Markup.keyboard([['Я парень', 'Я девушка']]).resize()
const interest = Markup.keyboard([['Парни', 'Девушки', 'Все']]).resize()
const city = Markup.inlineKeyboard([[{ text: 'Талдыкорган ФМН', callback_data: 'tk' }]])

export default {
    empty,
    languages,
    cancel,
    gender,
    interest,
    city,
}
