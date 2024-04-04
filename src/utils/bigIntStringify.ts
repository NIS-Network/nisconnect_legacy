export default function bigIntStringify(o: object): string {
    return JSON.stringify(o, (key, value) => (typeof value === 'bigint' ? value.toString() : value))
}
