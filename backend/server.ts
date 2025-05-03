import * as net from 'net';
import { ServerConfig } from "./types";
import * as fs from 'fs';
import { ConnectionHandler } from './connectionHandler';
import path from 'path';

const DEFAULT_PORT = 3000;
const DEFAULT_PUBLIC_DIR = path.join(__dirname, '../../frontend');


const serverConfig: ServerConfig = {
    port: DEFAULT_PORT,
    publicDir: DEFAULT_PUBLIC_DIR,
}

if(!fs.existsSync(serverConfig.publicDir)){
    console.error('Current working directory:', process.cwd());
    console.error(`Error: Frontend Directory not found at ${serverConfig.publicDir}`)
    process.exit(1);
}

const server: net.Server = net.createServer((socket : net.Socket) =>{
    console.log(`Client Connected ${socket.remoteAddress}:${socket.remotePort}`)
    const handler = new ConnectionHandler(socket, serverConfig);
});

server.listen(serverConfig.port, ()=>{
    console.log(`HTTP SERVER Listening on port ${serverConfig.port}`)
    console.log(`Serving Files from ${serverConfig.publicDir}`)
})

server.on('error', (err: Error)=>{
    console.error(`Server error ${err}`)
})

server.on('close', ()=>{
    console.log(`Server Closing.`)
})