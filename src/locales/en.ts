import { City, Gender, GenderPreference } from '@prisma/client'

const locale = {
    locale: {
        flag: '🇬🇧',
        name: 'English',
    },
    conversation: {
        search: 'Search for the partner',
        leave: 'Leave the conversation',
        stop: 'Stop searching',
    },
    settings: {
        button: 'Settings',
        text: (id: number, city: City, gender: Gender, genderPreference: GenderPreference) =>
            `User settings:\nBot language: ${locale.locale.flag} ${locale.locale.name}\nID: ${id}\nSchool: ${city}\n\nProfile settings:\nGender: ${gender}\nLooking for: ${genderPreference}`,
    },
    buttons: {
        cancel: 'Cancel',
        ok: 'OK',
        conversation: {
            search: 'Search for the partner',
            leave: 'Leave the conversation',
            stop: 'Stop searching',
        },
        viewProfiles: 'View profiles',
        profile: 'My profile',
        settings: {
            button: 'Settings',
            changeLanguage: 'Change language',
        },
    },
}

export default locale
