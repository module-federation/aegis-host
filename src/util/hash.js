import crypto from 'crypto';

export default function hash(data) {
  return crypto.createHash('sha1').update(data).digest('hex');
}