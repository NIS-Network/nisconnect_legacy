import { db } from '.'

export type Gender = 'male' | 'female'
export type valueOf<T> = T[keyof T]

export interface IProfile {
    id: number
    age: number
    gender: Gender
    interest: Gender | 'all'
    name: string
    bio: string
    photo: string
}

export const profileStatements = {
    select: db.prepare<IProfile['id']>('SELECT * FROM profile WHERE id = ?'),
    create: db.prepare<IProfile>('INSERT INTO profile (age, gender, interest, name, bio, photo) VALUES ($age, $gender, $interest, $name, $bio, $photo)'),
    update: (field: keyof IProfile) => db.prepare<{ value: valueOf<IProfile>; id: IProfile['id'] }>(`UPDATE profile SET ${field} = $value WHERE id = $id`),
    delete: db.prepare<IProfile['id']>('DELETE FROM profile WHERE id = ?'),
}
