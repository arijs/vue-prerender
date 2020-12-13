# @AriJS / Vue Prerender

This is used on https://github.com/arijs/vue-next-example and is mostly based on https://github.com/arijs/stream-xml-parser .

With Vue-next-example, you can build Vue SPAs without ANY build tool during development. You save your components and reload your browser, all your files are static html, js and css files.

But this means that in production, your users will have to asynchronously load all your components recursively. With this package, your pages can pre prerendered ahead of time to the final html structure that your user will see when all the loading is finished.

You can also use external data in your components, and that data will be printed to your pages so Vue can hydrate your app.

## Example

See https://github.com/arijs/vue-next-example and [the examples folder here](examples).

## License

[MIT](LICENSE).
