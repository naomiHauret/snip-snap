# snip-snap ✂️
snip-snap ✂️ is a micro service that aims to transform images (resize and convert) on the fly by just providing the image URL.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https%3A%2F%2Fgithub.com%2FnaomiHauret%2Fsnip-snap)

## Get started
### Pre-requisites
* Node version >= `14`
* `npm` version >= `6.14`

### Install
* Install the dependencies with `npm i`
* Launch the project with `npm start`
* Hit `localhost:3000/api/transform?src=https://i.imgur.com/apaN6tW.jpeg&w=200&format=webp`. That's it !

### Tests
* You can run unit tests with `npm test`
* Tests are written with [Jest](https://jestjs.io/)
## API
#### Endpoint
```
GET /api/transform?src=<image-url>&w=<width>&h=<height>&format=<format>
```
Returns the image from `<image-url>` to `<width>`/`<height>` dimensions and `<format>` format.

#### Parameters
* `src`: The target image source (url). Must returns a `image/*` as its `content-type`.
* `w`: Target width in px. Can't be above 16383px for `webp`
* `h`: Target height in px. Can't be above 16383px for `webp`
* `format`: Target format. Can be `webp`, `jpg`, `jpeg`, `avif`, or `png`. Default value is `webp`.

#### Responses

* `200`: Image transformed and returned with success
* `422`: Invalid parameters (invalid format/size, missing url)
* `404`: Page not be found.
* `413`: The transformed image is too large. The limit is 5MB. See [Vercel docs](https://vercel.com/docs/platform/limits#serverless-function-payload-size-limit)
* `500`: Internal server error. Something broke down, for some reason.

## Under the hood

snip-snap ✂️ uses [sharp](https://sharp.pixelplumbing.com/).

## Limitations

- The size of the transformed image must be < 5MB