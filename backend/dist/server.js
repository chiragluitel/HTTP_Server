"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const net = __importStar(require("net"));
const fs = __importStar(require("fs"));
const connectionHandler_1 = require("./connectionHandler");
const path_1 = __importDefault(require("path"));
const DEFAULT_PORT = 3000;
const DEFAULT_PUBLIC_DIR = path_1.default.join(__dirname, '../../frontend');
const serverConfig = {
    port: DEFAULT_PORT,
    publicDir: DEFAULT_PUBLIC_DIR,
};
if (!fs.existsSync(serverConfig.publicDir)) {
    console.error('Current working directory:', process.cwd());
    console.error(`Error: Frontend Directory not found at ${serverConfig.publicDir}`);
    process.exit(1);
}
const server = net.createServer((socket) => {
    console.log(`Client Connected ${socket.remoteAddress}:${socket.remotePort}`);
    const handler = new connectionHandler_1.ConnectionHandler(socket, serverConfig);
});
server.listen(serverConfig.port, () => {
    console.log(`HTTP SERVER Listening on port ${serverConfig.port}`);
    console.log(`Serving Files from ${serverConfig.publicDir}`);
});
server.on('error', (err) => {
    console.error(`Server error ${err}`);
});
server.on('close', () => {
    console.log(`Server Closing.`);
});
