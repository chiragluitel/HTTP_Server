import * as net from 'net'
import { HTTPResponse, ParsedHTTPRequest, ServerConfig } from './types';
import { parseHTTPRequest } from './httpParser';
import { serveStaticFile } from './fileServer';
import { buildHTTPResponse } from './httpBuilder';

const CRLF_CRLF = Buffer.from('\r\n\r\n');

export class ConnectionHandler{
    private socket: net.Socket;
    private buffer: Buffer;
    private request: ParsedHTTPRequest | null;
    private serverConfig: ServerConfig;

    constructor(socket: net.Socket, serverConfig: ServerConfig){
        this.socket  = socket;
        this.buffer = Buffer.alloc(0);
        this.request = null;
        this.serverConfig = serverConfig;

        this.socket.on('data', this.onData.bind(this));
        this.socket.on('end', this.onEnd.bind(this));
        this.socket.on('close', this.onClose.bind(this));
        this.socket.on('error', this.onError.bind(this));
    }

    private onData(chunk:Buffer): void{
        this.buffer = Buffer.concat([this.buffer, chunk]);

        const endOfHeadersIndex = this.buffer.indexOf(CRLF_CRLF);

        if (endOfHeadersIndex!==-1){
            const headersBuffer = this.buffer.subarray(0, endOfHeadersIndex+CRLF_CRLF.length);
            const headersString = headersBuffer.toString('utf8');

            const bodyBufferStart = this.buffer.subarray(endOfHeadersIndex+CRLF_CRLF.length);

            try{
                this.request = parseHTTPRequest(headersString)
                console.log(`Parsed Request: Method: ${this.request.method} ${this.request.path} from: ${this.getRemoteAddress()}`)

                const contentLengthHeader = this.request.headers['content-length'];
                let expectedBodyLength = 0;
                if (contentLengthHeader){
                    expectedBodyLength = parseInt(contentLengthHeader, 10);
                    if (isNaN(expectedBodyLength)){
                        console.warn(`Invalid Content-Length Header from: ${this.getRemoteAddress()}: ${contentLengthHeader}`)
                        this.sendErrorResponse(400, 'Bad Request', 'Invalid Content-Length Header')
                        return;
                    }
                }

                if (this.request.method === 'GET') {
                    if (expectedBodyLength > 0) {
                         console.warn(`Received Content-Length > 0 for GET request: ${this.request.path}. Ignoring body.`);

                    }
                    this.request.body = Buffer.alloc(0); 
                    this.processRequest();
                }else {
                    console.warn(`Unsupported method received: ${this.request.method} ${this.request.path}`);
                    this.sendErrorResponse(501, 'Not Implemented', `Method ${this.request.method} is not supported.`);
                    return;
                }
            }catch(err:any){
                console.log(`Error Received: ${err}`)
            }
        }
    }

    private async processRequest(): Promise<void> {
        if (!this.request){
            console.error(`Error`)
            this.sendErrorResponse(500, 'Internal Server Error', 'Server error.');
            return;
        }

        console.log(`Processing file in ${this.serverConfig.publicDir}`)

        let response: HTTPResponse;

        try{
            const fileResult = await serveStaticFile(this.request.path, this.serverConfig.publicDir)

            if (fileResult){
                console.log(`Files Found and Read Successfully!`)
                response = {
                    statusCode: 200,
                    statusText:'OK',
                    httpVersion: 'HTTP/1.1',
                    headers: {
                        "content-type": fileResult.contentType,
                        "content-length": fileResult.body.length.toString(),
                        'connection': 'close',
                        'server': 'my-minimal-server'
                    },
                    body: fileResult.body
                }
            }else{
                console.warn(`No file found at ${this.serverConfig.publicDir}`)
                const notFoundBody = Buffer.from('<h1>404 NOT FOUND</h1>')
                response = {
                    statusCode: 404,
                    statusText:'Not Found',
                    httpVersion: 'HTTP/1.1',
                    headers: {
                        "content-type": 'text/html',
                        "content-length": notFoundBody.length.toString(),
                        'connection': 'close',
                        'server': 'my-minimal-server'
                    },
                    body: notFoundBody};
                }
            console.log(`Files Have Been Read. Response has been built. Response Status is ${response.statusCode}, Response Text is ${response.statusText}`)
            const rawResponse =  buildHTTPResponse(response);

            console.log(`Sending Response ${response.statusCode} ${response.statusText} to ${this.getRemoteAddress()}`)
            this.socket.write(rawResponse, ()=>{console.log(`Response written to socket. Ending Connection`); this.socket.end()})
        }catch(err:any){
            console.error(`Error: ${err}`)
        }
    }

    private sendErrorResponse(statusCode:number, statusText: string, errorMessage: string): void {
        const errorBody = Buffer.from(`<h1>${statusCode} ${statusText} </h1> <p>${errorMessage}</p>`)
        const errorResponse: HTTPResponse = {
            statusCode: statusCode,
            statusText: statusText,
            httpVersion: 'HTTP/1.1',
            headers: {
                'content-type': 'txt/html',
                "content-length": statusText.length.toString(),
                'connection': 'close',
                'server': 'my-minimal-server'
            },
            body: errorBody
        }
        const rawResponse = buildHTTPResponse(errorResponse);

        console.error(`Error sending response ${statusCode} to ${this.getRemoteAddress()}`)
        this.socket.write(rawResponse, ()=>{this.socket.end()})
    }

    private onEnd(): void {
        console.log(`Client ${this.getRemoteAddress()} ended the connected`)
    }

    private onClose(hadError: boolean): void {
        if (hadError){
            console.log("Connection closed due to error")
        }else{
            console.log("Connection closed gracefully")
        }
        this.buffer = Buffer.alloc(0);
    }

    private onError(err:Error): void {
        console.error(`Socket error for ${this.getRemoteAddress()}`);
        if (!this.socket.destroyed){
            this.socket.destroy();
        }
    }

    private getRemoteAddress(): string{
        return `${this.socket.remoteAddress}:${this.socket.remotePort}`
    }
}