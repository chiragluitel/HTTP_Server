"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseHTTPRequest = parseHTTPRequest;
function parseHTTPRequest(rawHeadersString) {
    const lines = rawHeadersString.split('\r\n');
    const requestLine = lines[0];
    const requestLineParts = requestLine.split(' ');
    if (requestLineParts.length !== 3) {
        throw new Error(`Malformed Request Line: ${requestLine}`);
    }
    const method = requestLineParts[0].toUpperCase();
    const path = requestLineParts[1];
    const httpVersion = requestLineParts[2];
    if (!httpVersion.startsWith('HTTP/')) {
        throw new Error(`Malformed HTTP version in request line: "${httpVersion}"`);
    }
    const headers = {};
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line === '') {
            break;
        }
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
            const headerName = line.substring(0, colonIndex).trim().toLowerCase();
            const headerValue = line.substring(colonIndex + 1).trim();
            headers[headerName] = headerValue;
        }
        else {
            console.warn(`Malformed header line ignored during parsing: "${line}"`);
        }
    }
    const parsedRequest = {
        method: method,
        path: path,
        httpVersion: httpVersion,
        headers: headers,
    };
    return parsedRequest;
}
