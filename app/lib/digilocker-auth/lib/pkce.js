const crypto = require('crypto');

function base64UrlEncode(buffer) {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function createCodeVerifier(byteLength = 32) {
  const verifier = base64UrlEncode(crypto.randomBytes(byteLength));
  if (verifier.length < 43) {
    throw new Error('PKCE code_verifier must be at least 43 characters');
  }
  if (verifier.length > 128) {
    throw new Error('PKCE code_verifier must be at most 128 characters');
  }
  return verifier;
}

function createCodeChallenge(codeVerifier) {
  const hash = crypto.createHash('sha256').update(codeVerifier).digest();
  return base64UrlEncode(hash);
}

function createPkcePair(options = {}) {
  const codeVerifier = createCodeVerifier(options.byteLength || 32);
  const codeChallenge = createCodeChallenge(codeVerifier);
  return {
    codeVerifier,
    codeChallenge,
    codeChallengeMethod: 'S256',
  };
}

function createState(byteLength = 16) {
  return base64UrlEncode(crypto.randomBytes(byteLength));
}

module.exports = {
  base64UrlEncode,
  createCodeVerifier,
  createCodeChallenge,
  createPkcePair,
  createState,
};
