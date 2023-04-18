# Nostr Embed

A quick and easy way to embed a Nostr note anywhere on the web.

## Usage

Just add the following snippet to your site and change the parameters passed to the `nostrEmbed.init` function.

```html
<div id="some-container-id"></div>

<script>
  !(function () {
    const n=document.createElement('script');n.type='text/javascript';n.async=!0;n.src='https://cdn.jsdelivr.net/gh/nostrband/nostr-embed@latest/dist/nostr-embed.js';
    n.onload=function () {
      nostrEmbed.init(
        '10c9fb11f742e6dc05d8bbcb4af790a4453f1bc046e40ca1b5385996c63d93ba',
        '#some-container-id',
        'wss://relay.nostr.band'
      );
    };const a=document.getElementsByTagName('script')[0];a.parentNode.insertBefore(n, a);
  })();
</script>
```

### Parameters
1. **Required** (String): The first param is the hex ID of the note you'd like to embed.
2. **Optional** (String): The second param is a querySelector value for the HTML element that you'd like to embed the note into. If you don't pass this parameter, the note will be prepended to the body element.
3. **Optional** (String): URL of the Nostr relay that you'd like to read from. If you don't pass a third param this will default to `wss://relay.nostr.band`.

### Generate an embed code
You can also [generate an embed code on this page](https://embed.nostr.band).
## Contributing

* 👷 PRs are welcome
* 💬 Create issues with any bugs or feature requests
* ⚡ Zap sats to erskingardner@getalby.com if you'd like to help fund development.

### Todo – aka, stuff you can help with.

* We have zero tests so far.
* We need to implement pooling of relays so that we can check several instead of just one.
* We need to render replied to, and root events, if embedded event is a reply.
