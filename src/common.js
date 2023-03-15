import { bech32 } from 'bech32';

function hexToBytes(hex) {
  let bytes = [];
  for (let c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
}

export function getNoteId(hexId) {
  const bb = hexToBytes(hexId);
  const words = bech32.toWords(bb);
  return bech32.encode('note', words, 120);
}

export function getNpub(hexPubkey) {
  const bb = hexToBytes(hexPubkey);
  const words = bech32.toWords(bb);
  return bech32.encode('npub', words, 120);
}

export function formatNpub(npub) {
  return `${npub.slice(
    0,
    13
  )}...${npub.slice(-6)}`;
}

export function formatNoteId(noteId) {
  return `${noteId.slice(
    0,
    10,
  )}...${noteId.slice(-6)}`;
}
