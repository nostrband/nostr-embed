import { h, render } from 'preact';
import NostrEmbed from './components/nostrEmbed';

export function init(noteId, wrapper, relay) {
  const renderElement = document.querySelector(wrapper)
    ? document.querySelector(wrapper)
    : document.querySelector('body');

  render(h(NostrEmbed, { noteId, relay }), renderElement);
}
