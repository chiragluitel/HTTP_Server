import { StringLiteral } from "typescript";

export interface ServerConfig{
    port: number;
    publicDir: string;
}

export interface ParsedHTTPRequest{
    method: string;
    path: string;
    httpVersion: string;
    headers: HttpHeaders;
    body?: Buffer;
}

export interface HttpHeaders{
    host?: string;
    'user-agent'?: string;
    'accept'?: string;
    'accept-langauge'?:string;
    connection?:string;
    'content-type'?: string;
    'content-length'?: string;
    [key: string]:string | undefined;
}

export interface HTTPResponse{
    statusCode: number;
    statusText: string;
    httpVersion: string;
    headers: HttpHeaders
    body?: Buffer
}

