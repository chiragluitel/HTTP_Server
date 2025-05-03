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
Object.defineProperty(exports, "__esModule", { value: true });
exports.serveStaticFile = serveStaticFile;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.txt': 'text/plain',
};
const DEFAULT_MIME_TYPE = 'application/octet-stream';
async function serveStaticFile(requestPath, publicDir) {
    let filePath = requestPath;
    if (filePath == '/') {
        filePath = '/index.html';
    }
    const absoluteFilePath = path.join(publicDir, filePath);
    const resolvedPublicDir = path.resolve(publicDir);
    const resolvedFilePath = path.resolve(absoluteFilePath);
    if (!resolvedFilePath.startsWith(resolvedPublicDir)) {
        console.warn(`Possible File traversal attemt at path: ${requestPath}`);
        return null;
    }
    try {
        const stats = await fs.stat(resolvedFilePath); // Get file information
        if (!stats.isFile()) {
            console.log(`Path exists but is not a file: ${requestPath}`);
            return null;
        }
        const fileContent = await fs.readFile(resolvedFilePath);
        const ext = path.extname(resolvedFilePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || DEFAULT_MIME_TYPE;
        console.log(`Successfully read ${resolvedFilePath}, Content-Type: ${contentType}`);
        return {
            body: fileContent,
            contentType: contentType
        };
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`File not found: ${resolvedFilePath}`);
            return null;
        }
        else {
            console.error(`Error reading file ${resolvedFilePath}:`, error);
            throw error;
        }
    }
}
