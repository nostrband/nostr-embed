import { bech32 } from 'bech32';

const utf8Decoder = new TextDecoder('utf-8')
const hexes = Array.from({ length: 256 }, (v, i) => i.toString(16).padStart(2, '0'));

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

function fromWords(words) {
  return bech32.fromWords(words)
    .map((bytes) => bytes.toString(16).padStart(2, '0'))
    .join('');
}

export function parseNoteId(noteId) {
  const r = bech32.decode(noteId, 120);
  if (r.prefix != "note") return "";
  return fromWords(r.words);
}

export function parseNpub(npub) {
  const r = bech32.decode(npub, 120);
  if (r.prefix != "npub") return "";
  return fromWords(r.words);
}

export function parseNprofile(nprofile) {
  const r = bech32.decode(nprofile, 300);
  if (r.prefix != "nprofile") return null;

  const data = new Uint8Array(bech32.fromWords(r.words))
  const tlv = parseTLV(data);
  if (!tlv[0]?.[0]) throw new Error('missing TLV 0 for nprofile')
  if (tlv[0][0].length !== 32) throw new Error('TLV 0 should be 32 bytes')

  return {
    type: 'nprofile',
    data: {
      pubkey: bytesToHex(tlv[0][0]),
      relays: tlv[1] ? tlv[1].map(d => utf8Decoder.decode(d)) : []
    }
  }
}

export function parseNaddr(naddr) {

  if (!naddr) {
    return;
  }

  const r = bech32.decode(naddr, 300)
  const data = new Uint8Array(bech32.fromWords(r.words))
  const tlv = parseTLV(data);

  if (!tlv[0]?.[0]) throw new Error('missing TLV 0 for naddr')
  if (!tlv[2]?.[0]) throw new Error('missing TLV 2 for naddr')
  if (tlv[2][0].length !== 32) throw new Error('TLV 2 should be 32 bytes')
  if (!tlv[3]?.[0]) throw new Error('missing TLV 3 for naddr')
  if (tlv[3][0].length !== 4) throw new Error('TLV 3 should be 4 bytes')

  return {
    type: 'naddr',
    data: {
      identifier: utf8Decoder.decode(tlv[0][0]),
      pubkey: bytesToHex(tlv[2][0]),
      kind: parseInt(bytesToHex(tlv[3][0]), 16),
      relays: tlv[1] ? tlv[1].map(d => utf8Decoder.decode(d)) : []
    }
  }
}

export function formatNpub(npub) {
  return `${npub.slice(
    0,
    12
  )}...${npub.slice(-4)}`;
}

export function formatNoteId(noteId) {
  return `${noteId.slice(
    0,
    10,
  )}...${noteId.slice(-4)}`;
}


export function formatZapAmount(a) {
  a /= 1000;
  if (a >= 1000000) return (Math.round(a / 100000) / 10) + "M";
  if (a >= 1000) return (Math.round(a / 100) / 10) + "K";
  return a;
}

function parseTLV(data) {
  let result = {}
  let rest = data
  while (rest.length > 0) {
    let t = rest[0]
    let l = rest[1]
    let v = rest.slice(2, 2 + l)
    rest = rest.slice(2 + l)
    if (v.length < l) continue
    result[t] = result[t] || []
    result[t].push(v)
  }
  return result
}

function bytesToHex(uint8a) {
  // pre-caching improves the speed 6x
  if (!(uint8a instanceof Uint8Array)) throw new Error('Uint8Array expected');
  let hex = '';
  for (let i = 0; i < uint8a.length; i++) {
    hex += hexes[uint8a[i]];
  }
  return hex;
}
