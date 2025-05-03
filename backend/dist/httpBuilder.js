"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildHTTPResponse = buildHTTPResponse;
function buildHTTPResponse(response) {
    let responseString = '';
    const DEFAULT_MIME_TYPE = 'application/octet-stream';
    responseString += `${response.httpVersion} ${response.statusCode} ${response.statusText}\r\n`;
    for (const headerName in response.headers) {
        const headerValue = response.headers[headerName];
        if (headerValue !== undefined && headerValue !== null) {
            responseString += `${headerName}: ${headerValue}\r\n`;
        }
        else {
            console.warn(`Skipping empty or null header "${headerName}"`);
        }
    }
    //Adding Mandatory Headers
    if (!response.headers['content-type'] && response.body && response.body.length > 0) {
        responseString += `Content-Type: ${DEFAULT_MIME_TYPE}\r\n`; // Default if body exists but type is missing
    }
    if (!response.headers['content-length'] && response.body !== undefined) {
        responseString += `Content-Length: ${response.body.length}\r\n`;
    }
    if (!response.headers['connection']) {
        responseString += `Connection: close\r\n`;
    }
    responseString += `Server: my-minimal-server\r\n`;
    responseString += '\r\n';
    const headersBuffer = Buffer.from(responseString, 'utf8');
    const bodyBuffer = response.body || Buffer.alloc(0);
    const rawResponseBuffer = Buffer.concat([headersBuffer, bodyBuffer]);
    return rawResponseBuffer;
}
