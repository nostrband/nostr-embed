import { h, render } from 'preact';
import NostrEmbed from './components/nostrEmbed.jsx';

export function init(id, wrapper, relay, options) {

  if (!relay)
    relay = 'wss://relay.nostr.band/';

  const renderElement = document.querySelector(wrapper)
    ? document.querySelector(wrapper)
    : document.querySelector('body');

  render(h(NostrEmbed, { id, relay, options }), renderElement);
}
