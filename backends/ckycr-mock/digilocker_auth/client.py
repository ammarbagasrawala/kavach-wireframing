import base64
import secrets
import time
from typing import Any, Dict, Optional
from urllib.parse import urlencode, urlparse, parse_qsl, urlunparse

import httpx

from .pkce import create_pkce_pair, create_state


class DigilockerAuthError(Exception):
    def __init__(self, message: str, status: Optional[int] = None, code: Optional[str] = None, details: Any = None):
        super().__init__(message)
        self.status = status
        self.code = code
        self.details = details


class DigilockerClient:
    def __init__(
        self,
        client_id: str,
        redirect_uri: str,
        client_secret: Optional[str] = None,
        base_url: str = 'https://api.digitallocker.gov.in',
        use_basic_auth: bool = True,
        timeout_seconds: int = 15,
        mock_mode: bool = False,
        mock_authorize_url: Optional[str] = None,
        mock_tokens: Optional[Dict[str, Any]] = None,
        mock_user: Optional[Dict[str, Any]] = None,
    ):
        if not client_id and not mock_mode:
            raise ValueError('client_id is required')
        if not redirect_uri:
            raise ValueError('redirect_uri is required')

        base_url = base_url.rstrip('/')

        self.client_id = client_id
        self.client_secret = client_secret
        self.redirect_uri = redirect_uri
        self.use_basic_auth = use_basic_auth
        self.timeout_seconds = timeout_seconds
        self.mock_mode = bool(mock_mode)
        self.mock_authorize_url = mock_authorize_url
        self.mock_tokens = mock_tokens
        self.mock_user = mock_user

        self.endpoints = {
            'authorize': f'{base_url}/public/oauth2/1/authorize',
            'token': f'{base_url}/public/oauth2/1/token',
            'revoke': f'{base_url}/public/oauth2/1/revoke',
            'user': f'{base_url}/public/oauth2/1/user',
        }

    def _build_basic_auth(self) -> Optional[str]:
        if not self.client_secret:
            return None
        token = base64.b64encode(f'{self.client_id}:{self.client_secret}'.encode('utf-8')).decode('utf-8')
        return f'Basic {token}'

    def build_authorize_url(
        self,
        state: Optional[str] = None,
        response_type: str = 'code',
        scope: Optional[str] = None,
        code_challenge: Optional[str] = None,
        code_challenge_method: Optional[str] = None,
        dl_flow: Optional[str] = None,
        verified_mobile: Optional[str] = None,
        redirect_uri: Optional[str] = None,
    ) -> Dict[str, str]:
        state_value = state or create_state()
        if self.mock_mode:
            return {
                'url': self._build_mock_authorize_url(
                    state=state_value,
                    redirect_uri=redirect_uri or self.redirect_uri,
                    scope=scope,
                    dl_flow=dl_flow,
                    verified_mobile=verified_mobile,
                ),
                'state': state_value,
            }
        params = {
            'response_type': response_type,
            'client_id': self.client_id,
            'redirect_uri': redirect_uri or self.redirect_uri,
            'state': state_value,
        }
        if scope:
            params['scope'] = scope
        if code_challenge:
            params['code_challenge'] = code_challenge
        if code_challenge_method:
            params['code_challenge_method'] = code_challenge_method
        if dl_flow:
            params['dl_flow'] = dl_flow
        if verified_mobile:
            params['verified_mobile'] = verified_mobile

        return {
            'url': f"{self.endpoints['authorize']}?{urlencode(params)}",
            'state': state_value,
        }

    async def create_authorization_request(self, options: Optional[Dict[str, Any]], state_store) -> Dict[str, str]:
        if not hasattr(state_store, 'set'):
            raise ValueError('state_store with set/get/delete methods is required')

        options = options or {}
        pkce = create_pkce_pair()
        authorize = self.build_authorize_url(
            state=options.get('state'),
            response_type=options.get('response_type', 'code'),
            scope=options.get('scope'),
            code_challenge=pkce['code_challenge'],
            code_challenge_method=pkce['code_challenge_method'],
            dl_flow=options.get('dl_flow'),
            verified_mobile=options.get('verified_mobile'),
            redirect_uri=options.get('redirect_uri'),
        )

        await state_store.set(
            authorize['state'],
            {'code_verifier': pkce['code_verifier']},
            options.get('state_ttl_seconds'),
        )
        return authorize

    async def exchange_code_for_token(
        self,
        code: str,
        code_verifier: Optional[str] = None,
        redirect_uri: Optional[str] = None,
    ) -> Dict[str, Any]:
        if not code:
            raise ValueError('authorization code is required')
        if self.mock_mode:
            return self._mock_token_response()

        data = {
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': redirect_uri or self.redirect_uri,
            'client_id': self.client_id,
        }
        if code_verifier:
            data['code_verifier'] = code_verifier

        headers = {}
        basic = self._build_basic_auth()
        if basic and self.use_basic_auth:
            headers['Authorization'] = basic
        elif self.client_secret:
            data['client_secret'] = self.client_secret

        return await self._post_form(self.endpoints['token'], data, headers, 'Token exchange failed')

    async def refresh_access_token(self, refresh_token: str) -> Dict[str, Any]:
        if not refresh_token:
            raise ValueError('refresh_token is required')
        if self.mock_mode:
            return self._mock_token_response()

        data = {
            'grant_type': 'refresh_token',
            'refresh_token': refresh_token,
            'client_id': self.client_id,
        }

        headers = {}
        basic = self._build_basic_auth()
        if basic and self.use_basic_auth:
            headers['Authorization'] = basic
        elif self.client_secret:
            data['client_secret'] = self.client_secret

        return await self._post_form(self.endpoints['token'], data, headers, 'Token refresh failed')

    async def revoke_token(self, token: str, token_type_hint: Optional[str] = None) -> Dict[str, Any]:
        if not token:
            raise ValueError('token is required')
        if self.mock_mode:
            return {'revoked': True, 'mock': True}

        data = {'token': token}
        if token_type_hint:
            data['token_type_hint'] = token_type_hint

        headers = {}
        basic = self._build_basic_auth()
        if basic and self.use_basic_auth:
            headers['Authorization'] = basic
        elif self.client_secret:
            data['client_secret'] = self.client_secret

        return await self._post_form(self.endpoints['revoke'], data, headers, 'Token revoke failed')

    async def get_user_details(self, access_token: str) -> Dict[str, Any]:
        if not access_token:
            raise ValueError('access_token is required')
        if self.mock_mode:
            return self._mock_user_response()

        async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
            response = await client.get(
                self.endpoints['user'],
                headers={'Authorization': f'Bearer {access_token}'},
            )

        data = self._parse_response(response)
        if response.status_code < 200 or response.status_code >= 300:
            raise DigilockerAuthError('User fetch failed', status=response.status_code, details=data)
        return data

    async def handle_callback(self, code: str, state: str, state_store) -> Dict[str, Any]:
        if not hasattr(state_store, 'get'):
            raise ValueError('state_store with get/delete methods is required')
        if not state:
            raise ValueError('state is required')
        if not code:
            raise ValueError('authorization code is required')

        stored = await state_store.get(state)
        await state_store.delete(state)

        if not stored or 'code_verifier' not in stored:
            raise DigilockerAuthError('Invalid or expired state', code='invalid_state')

        return await self.exchange_code_for_token(code, stored['code_verifier'])

    async def _post_form(self, url: str, data: Dict[str, Any], headers: Dict[str, str], error_message: str):
        async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
            response = await client.post(url, data=data, headers=headers)

        parsed = self._parse_response(response)
        if response.status_code < 200 or response.status_code >= 300:
            raise DigilockerAuthError(error_message, status=response.status_code, details=parsed)
        return parsed

    @staticmethod
    def _parse_response(response: httpx.Response):
        try:
            return response.json()
        except Exception:
            return response.text

    def _build_mock_authorize_url(
        self,
        state: str,
        redirect_uri: str,
        scope: Optional[str],
        dl_flow: Optional[str],
        verified_mobile: Optional[str],
    ) -> str:
        target = self.mock_authorize_url or redirect_uri
        url = urlparse(target)
        query = dict(parse_qsl(url.query))
        query.update({'state': state, 'redirect_uri': redirect_uri})
        if scope:
            query['scope'] = scope
        if dl_flow:
            query['dl_flow'] = dl_flow
        if verified_mobile:
            query['verified_mobile'] = verified_mobile
        if not self.mock_authorize_url:
            query['code'] = 'mock_code'
            query['mock'] = '1'
        return urlunparse(url._replace(query=urlencode(query)))

    def _mock_token_response(self) -> Dict[str, Any]:
        if self.mock_tokens:
            return self.mock_tokens
        return {
            'access_token': f'mock_access_{secrets.token_urlsafe(8)}',
            'refresh_token': f'mock_refresh_{secrets.token_urlsafe(8)}',
            'token_type': 'Bearer',
            'expires_in': 3600,
            'scope': 'files.read user.info',
            'issued_at': int(time.time()),
            'mock': True,
        }

    def _mock_user_response(self) -> Dict[str, Any]:
        if self.mock_user:
            return self.mock_user
        return {
            'name': 'Mock User',
            'email': 'mock.user@example.com',
            'mobile': '9999999999',
            'mock': True,
        }
