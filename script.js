
import { spawn } from 'child_process';

let path = "C:\\Users\\grant\\iCloudDrive\\iCloud~md~obsidian\\Shakka\\.obsidian\\plugins\\obsidian-server\\"
let server = spawn('node', ['server.js'], {'shell':true, 'cwd':path});

server.stdout.on('data', output => {
    // the output data is captured and printed in the callback
    console.log("Output: ", output.toString())
})