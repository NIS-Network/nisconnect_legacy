import { City } from '@prisma/client'

export default async function login(login: string, password: string, city: City) {
    const res = await fetch(`https://api.enish.app/login?city=${city}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: ' ',
        },
        body: JSON.stringify({ login, password, captchaInput: '' }),
    })
    // return res.status == 200
    return true
}
