const crypto = require('crypto');
const { requestJson } = require('./http');
const { createPkcePair, createState } = require('./pkce');

class DigilockerAuthError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'DigilockerAuthError';
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
  }
}

function createDigilockerClient(config) {
  const mockMode = Boolean(config && config.mockMode);
  if (!config || (!config.clientId && !mockMode)) {
    throw new Error('clientId is required');
  }
  if (!config || !config.redirectUri) {
    throw new Error('redirectUri is required');
  }

  const baseUrl = (config.baseUrl || 'https://api.digitallocker.gov.in').replace(/\/$/, '');
  const clientId = config.clientId;
  const clientSecret = config.clientSecret || null;
  const redirectUri = config.redirectUri;
  const mock = config.mock || {};
  const mockAuthorizeUrl = mock.authorizeUrl || null;
  const mockTokens = mock.tokens || null;
  const mockUser = mock.user || null;

  const endpoints = {
    authorize: `${baseUrl}/public/oauth2/1/authorize`,
    token: `${baseUrl}/public/oauth2/1/token`,
    revoke: `${baseUrl}/public/oauth2/1/revoke`,
    user: `${baseUrl}/public/oauth2/1/user`,
  };

  function appendQuery(url, params) {
    const query = new URLSearchParams(params).toString();
    if (!query) return url;
    return url.includes('?') ? `${url}&${query}` : `${url}?${query}`;
  }

  function buildMockAuthorizeUrl(params, state) {
    const redirectTarget = params.redirectUri || redirectUri;
    if (mockAuthorizeUrl) {
      const query = { state, redirect_uri: redirectTarget };
      if (params.scope) query.scope = params.scope;
      if (params.dlFlow) query.dl_flow = params.dlFlow;
      if (params.verifiedMobile) query.verified_mobile = params.verifiedMobile;
      return appendQuery(mockAuthorizeUrl, query);
    }
    return appendQuery(redirectTarget, {
      code: params.mockCode || 'mock_code',
      state,
      mock: '1',
    });
  }

  function buildAuthorizeUrl(params = {}) {
    const state = params.state || createState();
    if (mockMode) {
      return { url: buildMockAuthorizeUrl(params, state), state };
    }
    const search = new URLSearchParams({
      response_type: params.responseType || 'code',
      client_id: clientId,
      redirect_uri: params.redirectUri || redirectUri,
      state,
    });

    if (params.scope) search.set('scope', params.scope);
    if (params.codeChallenge) search.set('code_challenge', params.codeChallenge);
    if (params.codeChallengeMethod) search.set('code_challenge_method', params.codeChallengeMethod);
    if (params.dlFlow) search.set('dl_flow', params.dlFlow);
    if (params.verifiedMobile) search.set('verified_mobile', params.verifiedMobile);

    return { url: `${endpoints.authorize}?${search.toString()}`, state };
  }

  async function createAuthorizationRequest(options = {}, stateStore) {
    if (!stateStore || typeof stateStore.set !== 'function') {
      throw new Error('stateStore with set/get/delete methods is required');
    }

    const pkce = createPkcePair();
    const { url, state } = buildAuthorizeUrl({
      ...options,
      codeChallenge: pkce.codeChallenge,
      codeChallengeMethod: pkce.codeChallengeMethod,
    });

    await stateStore.set(state, { codeVerifier: pkce.codeVerifier }, options.stateTtlMs);

    return { url, state };
  }

  function buildBasicAuthHeader() {
    if (!clientSecret) return null;
    const token = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    return `Basic ${token}`;
  }

  async function exchangeCodeForToken({ code, codeVerifier, redirectUriOverride }) {
    if (!code) throw new Error('authorization code is required');
    if (mockMode) {
      return {
        access_token: `mock_access_${crypto.randomBytes(8).toString('hex')}`,
        refresh_token: `mock_refresh_${crypto.randomBytes(8).toString('hex')}`,
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'files.read user.info',
        mock: true,
        ...(mockTokens || {}),
      };
    }

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUriOverride || redirectUri,
      client_id: clientId,
    });

    if (codeVerifier) body.set('code_verifier', codeVerifier);

    const headers = {};
    const basic = buildBasicAuthHeader();
    if (basic) {
      headers.Authorization = basic;
    } else if (clientSecret) {
      body.set('client_secret', clientSecret);
    }

    const response = await requestJson({
      method: 'POST',
      url: endpoints.token,
      headers,
      body,
    });

    if (response.status < 200 || response.status >= 300) {
      throw new DigilockerAuthError('Token exchange failed', {
        status: response.status,
        details: response.data,
      });
    }

    return response.data;
  }

  async function refreshAccessToken({ refreshToken }) {
    if (!refreshToken) throw new Error('refreshToken is required');
    if (mockMode) {
      return {
        access_token: `mock_access_${crypto.randomBytes(8).toString('hex')}`,
        refresh_token: `mock_refresh_${crypto.randomBytes(8).toString('hex')}`,
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'files.read user.info',
        mock: true,
        ...(mockTokens || {}),
      };
    }

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
    });

    const headers = {};
    const basic = buildBasicAuthHeader();
    if (basic) {
      headers.Authorization = basic;
    } else if (clientSecret) {
      body.set('client_secret', clientSecret);
    }

    const response = await requestJson({
      method: 'POST',
      url: endpoints.token,
      headers,
      body,
    });

    if (response.status < 200 || response.status >= 300) {
      throw new DigilockerAuthError('Token refresh failed', {
        status: response.status,
        details: response.data,
      });
    }

    return response.data;
  }

  async function revokeToken({ token, tokenTypeHint }) {
    if (!token) throw new Error('token is required');
    if (mockMode) {
      return { revoked: true, mock: true };
    }

    const body = new URLSearchParams({ token });
    if (tokenTypeHint) body.set('token_type_hint', tokenTypeHint);

    const headers = {};
    const basic = buildBasicAuthHeader();
    if (basic) {
      headers.Authorization = basic;
    } else if (clientSecret) {
      body.set('client_secret', clientSecret);
    }

    const response = await requestJson({
      method: 'POST',
      url: endpoints.revoke,
      headers,
      body,
    });

    if (response.status < 200 || response.status >= 300) {
      throw new DigilockerAuthError('Token revoke failed', {
        status: response.status,
        details: response.data,
      });
    }

    return response.data;
  }

  async function getUserDetails({ accessToken }) {
    if (!accessToken) throw new Error('accessToken is required');
    if (mockMode) {
      return (
        mockUser || {
          name: 'Mock User',
          email: 'mock.user@example.com',
          mobile: '9999999999',
          mock: true,
        }
      );
    }

    const response = await requestJson({
      method: 'GET',
      url: endpoints.user,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status < 200 || response.status >= 300) {
      throw new DigilockerAuthError('User fetch failed', {
        status: response.status,
        details: response.data,
      });
    }

    return response.data;
  }

  async function handleCallback({ code, state }, stateStore) {
    if (!stateStore || typeof stateStore.get !== 'function') {
      throw new Error('stateStore with get/delete methods is required');
    }
    if (!state) throw new Error('state is required');

    const stored = await stateStore.get(state);
    await stateStore.delete(state);

    if (!stored || !stored.codeVerifier) {
      throw new DigilockerAuthError('Invalid or expired state', { code: 'invalid_state' });
    }

    return exchangeCodeForToken({ code, codeVerifier: stored.codeVerifier });
  }

  return {
    endpoints,
    buildAuthorizeUrl,
    createAuthorizationRequest,
    exchangeCodeForToken,
    refreshAccessToken,
    revokeToken,
    getUserDetails,
    handleCallback,
  };
}

module.exports = {
  DigilockerAuthError,
  createDigilockerClient,
};
