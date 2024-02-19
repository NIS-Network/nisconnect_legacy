import { db } from '.'

export type City = 'tk'
export type valueOf<T> = T[keyof T]

export interface IUser {
    id: number
    profile: number
    partner?: number
    registrationDate: number
    login: string
    password: string
    city: City
}

export const userStatements = {
    select: db.prepare<IUser['id']>('SELECT * FROM user WHERE id = ?'),
    create: db.prepare<Omit<IUser, 'partner'>>('INSERT INTO user (id, profile, registrationDate, login, password, city) VALUES ($id, $profile, $registrationDate, $login, $password, $city)'),
    update: (field: keyof IUser) => db.prepare<{ value: valueOf<IUser>; id: IUser['id'] }>(`UPDATE user SET ${field} = $value WHERE id = $id`),
    delete: db.prepare<IUser['id']>('DELETE FROM user WHERE id = ?'),
}
