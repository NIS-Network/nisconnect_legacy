/* eslint-disable @typescript-eslint/no-explicit-any */
export default <T>(arr: T[], size: number): T[][] => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size))
}
