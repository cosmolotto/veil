import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

const ENCRYPTION_PREFIX = 'enc:v1';
const IV_LENGTH = 12;

function getEncryptionKey(): Buffer {
  const raw = process.env.RESPONSE_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error('Missing RESPONSE_ENCRYPTION_KEY');
  }

  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    return Buffer.from(raw, 'hex');
  }

  return createHash('sha256').update(raw).digest();
}

export function encryptText(value: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    ENCRYPTION_PREFIX,
    iv.toString('base64'),
    encrypted.toString('base64'),
    tag.toString('base64'),
  ].join(':');
}

export function decryptText(value: string): string {
  if (!value.startsWith(`${ENCRYPTION_PREFIX}:`)) {
    return value;
  }

  const [, , iv, encrypted, tag] = value.split(':');
  if (!iv || !encrypted || !tag) {
    throw new Error('Malformed encrypted payload');
  }

  const decipher = createDecipheriv(
    'aes-256-gcm',
    getEncryptionKey(),
    Buffer.from(iv, 'base64')
  );
  decipher.setAuthTag(Buffer.from(tag, 'base64'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted, 'base64')),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

export function makeContentPreview(value: string, maxLength = 60): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}
