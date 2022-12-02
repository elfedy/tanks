const	chokidar = require('chokidar');
const { exec } = require('child_process');

console.log("Started watching /src directory...");

const command = './bash.rc';

chokidar.watch('./src', (path) => {
  console.log(`Detected change in ${path}.`);
  try {
    exec(command, (error, stdout, stderr) => {
      console.log(stdout);
      if(error) {
        console.log(`error: ${error.message}`);
      }
      if(stderr) {
        console.log(`stderr: ${stderr}`);
      }
    })
  } catch(e) {
    console.log(`FAILED: ${e}`);
  }
})
