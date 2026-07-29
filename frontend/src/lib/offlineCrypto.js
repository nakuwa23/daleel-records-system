import * as ed from "@noble/ed25519";

function canonicalStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalStringify).join(",")}]`;
  }
  if (value !== null && typeof value === "object") {
    const keys = Object.keys(value).sort();
    return `{${keys
      .map((key) => `${JSON.stringify(key)}:${canonicalStringify(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function base64ToBytes(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function verifyRecordSignature(recordDict, signatureB64, publicKeyB64) {
  try {
    const message = new TextEncoder().encode(canonicalStringify(recordDict));
    const signature = base64ToBytes(signatureB64);
    const publicKey = base64ToBytes(publicKeyB64);
    return await ed.verifyAsync(signature, message, publicKey);
  } catch {
    return false;
  }
}
