import { City } from '@prisma/client'

export default async function login(login: string, password: string, city: City) {
    const res = await fetch(`http://api.enish.app/login?city=${city}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer null',
        },
        body: JSON.stringify({ login, password, captchaInput: '' }),
    })
    // return res.status == 200
    return true
}
