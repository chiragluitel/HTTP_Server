import * as fs from 'fs/promises';
import * as path from 'path';

export interface FileServerResult{
    body: Buffer;
    contentType: string;
}

const MIME_TYPES: { [key: string]: string } = {
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

const DEFAULT_MIME_TYPE = 'application/octet-stream'

export async function serveStaticFile (requestPath: string, publicDir: string): Promise<FileServerResult | null>{
    let filePath = requestPath;

    if (filePath == '/'){
        filePath = '/index.html'
    }

    const absoluteFilePath = path.join(publicDir, filePath);

    const resolvedPublicDir = path.resolve(publicDir)
    const resolvedFilePath = path.resolve(absoluteFilePath)

    if(!resolvedFilePath.startsWith(resolvedPublicDir)){
        console.warn(`Possible File traversal attemt at path: ${requestPath}`)
        return null;
    }
    try{
        const stats = await fs.stat(resolvedFilePath); // Get file information

        if (!stats.isFile()) {
            console.log(`Path exists but is not a file: ${requestPath}`);
            return null;
        }
        const fileContent: Buffer = await fs.readFile(resolvedFilePath);

        const ext = path.extname(resolvedFilePath).toLowerCase();

        const contentType = MIME_TYPES[ext] || DEFAULT_MIME_TYPE;

        console.log(`Successfully read ${resolvedFilePath}, Content-Type: ${contentType}`)
        return{
            body: fileContent,
            contentType: contentType
        };
    }catch(error:any){
        if (error.code === 'ENOENT') {
            console.log(`File not found: ${resolvedFilePath}`);
            return null;
        } else {
            console.error(`Error reading file ${resolvedFilePath}:`, error);
            throw error; 
        }
    }

}
