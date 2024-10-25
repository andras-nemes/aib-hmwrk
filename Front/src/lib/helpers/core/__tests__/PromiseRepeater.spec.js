import { PromiseRepeater } from '../PromiseRepeater'
import { vi, describe, test, expect } from 'vitest'

describe('PromiseRepeater', () => {
    test('queryAll resolves', async () => {
        const operations = [param => new Promise(res => res()), () => new Promise(res => res())]

        const promiseRepeater = new PromiseRepeater()
        await expect(promiseRepeater.queryAll(operations)).resolves.toEqual([undefined, undefined])
    })

    test('queryAll resolves using handler', async () => {
        const operations = [
            param => new Promise(res => res()),
            () => new Promise((res, rej) => rej(new Error('bad error'))),
        ]

        const promiseRepeater = new PromiseRepeater()

        await expect(
            promiseRepeater.queryAll(operations, err => {
                return undefined
            })
        ).resolves.toEqual([undefined, undefined])
    })

    test('queryAll rejects', async () => {
        const operations = [
            param => new Promise(res => res()),
            () => new Promise((res, rej) => rej(new Error('bad error'))),
        ]

        const promiseRepeater = new PromiseRepeater(2, 1)
        await expect(promiseRepeater.queryAll(operations)).rejects.toThrow('bad error')
    })

    test('queryAll rejects using handler', async () => {
        const operations = [
            param => new Promise(res => res()),
            () => new Promise((res, rej) => rej(new Error('bad error'))),
        ]

        const promiseRepeater = new PromiseRepeater(2, 1)

        await expect(
            promiseRepeater.queryAll(operations, err => {
                throw err
            })
        ).rejects.toThrow('bad error')
    })

    test('queryAll resolve after several tries', async () => {
        // first call to promise generator function will fail,
        // but the next will resolve
        const promiseGenerator = () =>
            vi
                .fn(param => new Promise(res => res()))
                .mockImplementationOnce(() => new Promise((res, rej) => rej('bad error')))

        const operations = [promiseGenerator()]

        const promiseRepeater = new PromiseRepeater(2, 1)
        await expect(promiseRepeater.queryAll(operations)).resolves.toEqual([undefined])
    })

    test('query resolves', async () => {
        const promiseRepeater = new PromiseRepeater()
        await expect(promiseRepeater.query(() => new Promise(res => res()))).resolves.toEqual(
            undefined
        )
    })

    test('query rejects', async () => {
        const promiseRepeater = new PromiseRepeater(2, 1)
        await expect(
            promiseRepeater.query(() => new Promise((_res, rej) => rej(new Error('bad error'))))
        ).rejects.toThrow('bad error')
    })

    test('query resolve after several tries', async () => {
        // first call to promise generator function will fail,
        // but the next will resolve
        const promiseGenerator = () =>
            vi
                .fn(param => new Promise(res => res()))
                .mockImplementationOnce(
                    () => new Promise((res, rej) => rej(new Error('bad error')))
                )

        const promiseRepeater = new PromiseRepeater(2, 1)
        await expect(promiseRepeater.query(promiseGenerator(), null)).resolves.toEqual([undefined])
    })
})
