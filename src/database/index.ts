import DatabaseConstructor, { Database } from 'better-sqlite3'

export const db: Database = new DatabaseConstructor('src/database/index.db')

export function init() {
    db.exec(`CREATE TABLE IF NOT EXISTS profile (
        id INTEGER,
        age INTEGER,
        gender TEXT,
        interest TEXT,
        name TEXT,
        bio TEXT,
        photo TEXT
    )`)
    db.exec(`CREATE TABLE IF NOT EXISTS user (
        id INTEGER,
        profile INTEGER,
        partner INTEGER UNIQUE,
        registrationDate INTEGER,
        login INTEGER,
        city TEXT,
        password TEXT
    )`)
}

init()
