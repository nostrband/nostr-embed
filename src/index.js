import { h, render } from 'preact';
import NostrEmbed from './components/nostrEmbed';

export function init(noteId, wrapper, relay) {

  if (!relay)
    relay = 'wss://relay.nostr.band/all';

  const renderElement = document.querySelector(wrapper)
    ? document.querySelector(wrapper)
    : document.querySelector('body');

  render(h(NostrEmbed, { noteId, relay }), renderElement);
}
