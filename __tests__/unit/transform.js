import { createMocks } from 'node-mocks-http'
import transform from '@api/transform'
import { FALLBACK_FORMAT } from '@api/transform'

beforeEach(async () => {
  jest.setTimeout(10000)
})

describe('/api/transform', () => {
  test('Image from a valid url is resized, formatted and returned', async () => {
    const format = 'jpeg'
    const w = '500'
    const h = '250'
    const src = 'https://i.imgur.com/apaN6tW.jpg'
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        src,
        w,
        h,
        format,
      },
    })
    await transform(req, res)
    expect(res._getHeaders()['content-type']).toBe(`image/${format}`)
    expect(res._getHeaders()['x-imagesize']).toBe(`${w}x${h}`)
    expect(res._getStatusCode()).toBe(200)
  })

  test('Image from a valid url is resized to a given width and returned as fallback format', async () => {
    const src = 'https://i.imgur.com/apaN6tW.jpg'
    const w = '500'
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        w,
        src,
      },
    })
    await transform(req, res)
    expect(res._getHeaders()['content-type']).toBe(`image/${FALLBACK_FORMAT}`)
    expect(res._getHeaders()['x-imagesize']).toBe(`${w}xundefined`)
    expect(res._getStatusCode()).toBe(200)
  })

  test('Image from a valid url is resized to a given height and returned as fallback format', async () => {
    const h = '300'
    const src = 'https://i.imgur.com/apaN6tW.jpg'
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        h,
        src,
      },
    })
    await transform(req, res)
    expect(res._getHeaders()['content-type']).toBe(`image/${FALLBACK_FORMAT}`)
    expect(res._getHeaders()['x-imagesize']).toBe(`undefinedx${h}`)
    expect(res._getStatusCode()).toBe(200)
  })

  test('Image from a valid url is returned as given format', async () => {
    const format = 'png'
    const src = 'https://i.imgur.com/apaN6tW.jpg'
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        format,
        src,
      },
    })
    await transform(req, res)
    expect(res._getHeaders()['content-type']).toBe(`image/${format}`)
    expect(res._getHeaders()['x-imagesize']).toBe('undefinedxundefined')
    expect(res._getStatusCode()).toBe(200)
  })

  test("Image from a valid url can't be formatted to an unsupported/invalid format", async () => {
    const format = 'bmp'
    const src = 'https://i.imgur.com/apaN6tW.jpg'
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        format,
        src,
      },
    })
    await transform(req, res)
    expect(res._getStatusCode()).toBe(422)
  })

  test("Image from a valid url can't be resized (invalid width)", async () => {
    const src = 'https://i.imgur.com/apaN6tW.jpg'
    const w = 'abc'
    const h = '120'
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        w,
        h,
        src,
      },
    })
    await transform(req, res)
    expect(res._getStatusCode()).toBe(422)
  })

  test("Image from a valid url can't be resized (invalid height)", async () => {
    const src = 'https://i.imgur.com/apaN6tW.jpg'
    const h = '12°'
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        h,
        src,
      },
    })
    await transform(req, res)
    expect(res._getStatusCode()).toBe(422)
  })

  test('Image from a valid url is generated but not returned because it is >5MB', async () => {
    const src = 'https://i.imgur.com/apaN6tW.jpg'
    const w = '14000'
    const format = 'jpg'

    const { req, res } = createMocks({
      method: 'GET',
      query: {
        w,
        src,
        format,
      },
    })

    await transform(req, res)
    expect(res._getHeaders()['content-type']).toBe('application/json')
    expect(res._getStatusCode()).toBe(413)
  })

  test("Image can't be generated (page not found)", async () => {
    const src = 'https://i.imgur.com/thispagedoesnotexistforsure'
    const w = '500'
    const h = '400'
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        src,
        w,
        h,
      },
    })
    await transform(req, res)
    expect(res._getHeaders()['content-type']).toBe('application/json')
    expect(res._getStatusCode()).toBe(404)
  })

  test("Image can't be generated (no source/url provided)", async () => {
    const format = 'png'
    const w = '340'
    const h = '200'

    const { req, res } = createMocks({
      method: 'GET',
      query: {
        format,
        h,
        w,
      },
    })
    await transform(req, res)
    expect(res._getStatusCode()).toBe(422)
  })

  test("Image can't be generated (url doesn't point to an image)", async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        from: 'https://google.com/',
      },
    })
    await transform(req, res)
    expect(res._getHeaders()['content-type']).toBe('application/json')
    expect(res._getStatusCode()).toBe(422)
  })

  test("Webp image can't be generated (width too large)", async () => {
    const src = 'https://i.imgur.com/apaN6tW.jpg'
    const w = '34000'
    const h = '200'
    const format = 'webp'

    const { req, res } = createMocks({
      method: 'GET',
      query: {
        src,
        w,
        h,
        format,
      },
    })
    await transform(req, res)
    expect(res._getHeaders()['content-type']).toBe('application/json')
    expect(res._getStatusCode()).toBe(422)
  })

  test("Webp image can't be generated (height too large)", async () => {
    const src = 'https://i.imgur.com/apaN6tW.jpg'
    const h = '34000'
    const w = '200'
    const format = 'webp'

    const { req, res } = createMocks({
      method: 'GET',
      query: {
        src,
        w,
        h,
        format,
      },
    })
    await transform(req, res)
    expect(res._getHeaders()['content-type']).toBe('application/json')
    expect(res._getStatusCode()).toBe(422)
  })

  test("Image without a specified format can't be generated (height too large for fallback format webp)", async () => {
    const src = 'https://i.imgur.com/apaN6tW.jpg'
    const h = '34000'
    const w = '200'

    const { req, res } = createMocks({
      method: 'GET',
      query: {
        src,
        w,
        h,
      },
    })
    await transform(req, res)
    expect(res._getHeaders()['content-type']).toBe('application/json')
    expect(res._getStatusCode()).toBe(422)
  })

  test("Image without a specified format can't be generated (width too large for fallback format webp)", async () => {
    const src = 'https://i.imgur.com/apaN6tW.jpg'
    const w = '34000'
    const h = '200'

    const { req, res } = createMocks({
      method: 'GET',
      query: {
        src,
        w,
        h,
      },
    })
    await transform(req, res)
    expect(res._getHeaders()['content-type']).toBe('application/json')
    expect(res._getStatusCode()).toBe(422)
  })
})
