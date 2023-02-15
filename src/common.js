import { bech32 } from 'bech32';
import * as secp from '@noble/secp256k1';

function hexToBytes(hex) {
  const bytes = [];
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

async function verifyNostrSignature(event) {
  await secp.schnorr.verify(event.sig, event.id, event.pubkey);
}

async function calculateNostrEventID(event) {
  const s = JSON.stringify([
    0,
    event.pubkey,
    event.created_at,
    event.kind,
    event.tags,
    event.content,
  ]);
  const utf8 = new TextEncoder().encode(s);
  return secp.utils.sha256(utf8).then((hashBuffer) => {
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((bytes) => bytes.toString(16).padStart(2, '0'))
      .join('');
    return hashHex;
  });
}

async function validateNostrEvent(event) {
  // Validate basic fields
  if (typeof event.content !== 'string') return false;
  if (typeof event.created_at !== 'number') return false;
  if (!Array.isArray(event.tags)) return false;
  for (let i = 0; i < event.tags.length; i++) {
    const tag = event.tags[i];
    if (!Array.isArray(tag)) return false;
    for (let j = 0; j < tag.length; j++) {
      if (typeof tag[j] === 'object') return false;
    }
  }
  // Verify event ID
  if (event.id !== (await calculateNostrEventID(event))) return false;
  return true;
}

export async function isValidEvent(event) {
  return (
    event.id &&
    event.pubkey &&
    event.sig &&
    (await validateNostrEvent(event)) &&
    verifyNostrSignature(event)
  );
}
