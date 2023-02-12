# Nostr Embed

A quick and easy way to embed a Nostr note anywhere on the web.

## Usage

Just add the following snippet to your site and change the parameters passed to the `nostrEmbed.init` function.

```html
<div id="nostr-embed"></div>

<script>
  !(function () {
    const n=document.createElement('script');n.type='text/javascript';n.async=!0;n.src='nostr-embed.js';
    n.onload=function () {
      nostrEmbed.init(
        '10c9fb11f742e6dc05d8bbcb4af790a4453f1bc046e40ca1b5385996c63d93ba',
        '#nostr-embed'
      );
    };const a=document.getElementsByTagName('script')[0];a.parentNode.insertBefore(n, a);
  })();
</script>
```

### Parameters
1. **Required** (String): The first param is the hex ID of the note you'd like to embed.
2. **Optional** (String): The second param is a querySelector value for the HTML element that you'd like to embed the note into. If you don't pass this parameter, the note will be prepended to the body element.

## Contributing

PRs are welcome.

### Todo – aka, stuff you can help with.

* The bundle size is WAYYY too big right now because of the [nostr-tools](https://github.com/nbd-wtf/nostr-tools) library we're using to fetch data. We're looking into ways to make it much smaller without sacrificing signature verification.
* We have zero tests so far.
* We need to implement pooling of relays so that we can check several instead of just one.
