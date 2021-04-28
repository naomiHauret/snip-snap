import fetch from 'node-fetch'
import sharp from 'sharp'
import urlExist from 'url-exist'

export const FALLBACK_FORMAT = 'webp'
const MAX_IMG_SIZE = 5242880 // ~ 5MB ; maximum image size
const ACCEPTED_FORMATS = ['webp', 'jpeg', 'jpg', 'png', 'avif']
const MAX_SIZE_WEBP = 16383

export default async function ({ query: { src, w, h, format } }, res) {
  try {
    const imgFormat = format ? format : FALLBACK_FORMAT
    if (!src)
      return res.status(422).json({
        error: `A source image is required.`,
        i18n_id: '@snip_snap/unprocessable_entity',
      })

    if ((w && isNaN(w)) || (h && isNaN(h))) {
      return res.status(422).json({
        error: `The provided width and/or height is not a number.`,
        i18n_id: '@snip_snap/unprocessable_entity',
      })
    }

    if (!ACCEPTED_FORMATS.includes(imgFormat)) {
      return res.status(422).json({
        error: `The image format ${imgFormat} is not supported or doesn't exist.`,
        i18n_id: '@snip_snap/unprocessable_entity',
      })
    }

    if (imgFormat === 'webp' && (parseInt(w) >= MAX_SIZE_WEBP || parseInt(h) > MAX_SIZE_WEBP)) {
      return res.status(422).json({
        error: `The provided width and/or height is too large for the targeted format (webp). Both width and height need to be <${MAX_SIZE_WEBP}px.`,
        i18n_id: '@snip_snap/unprocessable_entity',
      })
    }

    const urlExists = await urlExist(src)
    if (!urlExists) {
      return res.status(404).json({ error: `Page at url ${src} could not be found`, i18n_id: '@snip_snap/not_found' })
    }

    const response = await fetch(src, {
      headers: {
        Accept: 'image/*',
      },
    })

    const buffedImg = await response.buffer()

    // Magick !
    const img = await sharp(buffedImg)
      .resize({
        height: parseInt(h) || undefined,
        width: parseInt(w) || undefined,
      })
      .toFormat(imgFormat)
      .toBuffer()

    if (img.length >= MAX_IMG_SIZE) {
      // Output image is too heavy
      return res
        .status(413)
        .json({ error: 'The image is too large to be sent.', i18n_id: '@snip_snap/payload_too_large' })
    }

    // Success
    res.statusCode = 200
    res.setHeader('Content-Type', `image/${imgFormat}`)
    res.setHeader('X-ImageSize', `${w}x${h}`)
    return res.send(img)
  } catch (e) {
    return res.status(500).json({ error: `Unexpected error. ${e}`, i18n_id: '@snip_snap/unexpected_error' })
  }
}
