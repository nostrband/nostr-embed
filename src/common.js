import { bech32 } from 'bech32';

function hexToBytes(hex) {
    let bytes = [];
    for (let c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

export function getNoteId(hexId) {
  const bb = hexToBytes(hexId);
  console.log("note", hexId, bb);
  const words = bech32.toWords(bb);
  return bech32.encode('note', words, 120);
}

export function getNpub(hexPubkey) {
  const bb = hexToBytes(hexPubkey);
  console.log("pubkey", hexPubkey, bb);
  const words = bech32.toWords(bb);
  return bech32.encode('npub', words, 120);
}
