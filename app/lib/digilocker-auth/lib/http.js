const https = require('https');
const http = require('http');
const { URL } = require('url');

function request({ method = 'GET', url, headers = {}, body, timeoutMs = 15000 }) {
  return new Promise((resolve, reject) => {
    const target = new URL(url);
    const isHttps = target.protocol === 'https:';
    const client = isHttps ? https : http;

    let payload = null;
    const finalHeaders = { ...headers };

    if (body !== undefined && body !== null) {
      if (typeof body === 'string' || Buffer.isBuffer(body)) {
        payload = body;
      } else if (body instanceof URLSearchParams) {
        payload = body.toString();
        if (!finalHeaders['Content-Type']) {
          finalHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
        }
      } else {
        payload = JSON.stringify(body);
        if (!finalHeaders['Content-Type']) {
          finalHeaders['Content-Type'] = 'application/json';
        }
      }
      if (!finalHeaders['Content-Length']) {
        finalHeaders['Content-Length'] = Buffer.byteLength(payload);
      }
    }

    const req = client.request(
      {
        method,
        hostname: target.hostname,
        path: target.pathname + target.search,
        port: target.port || (isHttps ? 443 : 80),
        headers: finalHeaders,
      },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const bodyText = Buffer.concat(chunks).toString('utf8');
          resolve({
            status: res.statusCode,
            headers: res.headers,
            bodyText,
          });
        });
      }
    );

    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`Request timed out after ${timeoutMs}ms`));
    });

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

async function requestJson(options) {
  const response = await request(options);
  let data;
  try {
    data = response.bodyText ? JSON.parse(response.bodyText) : {};
  } catch (error) {
    data = response.bodyText;
  }
  return { ...response, data };
}

module.exports = {
  request,
  requestJson,
};
