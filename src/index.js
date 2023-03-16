import { h, render } from 'preact';
import NostrEmbed from './components/nostrEmbed';

export function init(req) {

  const noteId = req.noteId;
  const relay = req.relay || 'wss://relay.nostr.band/all';

  const wrapper = `.nostr-embed[data-nostr='${noteId}']`;
  const renderElement = document.querySelector(wrapper)
    ? document.querySelector(wrapper)
    : document.querySelector('body');

  render(h(NostrEmbed, { noteId, relay }), renderElement);
}
