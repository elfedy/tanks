# Tanks
Tank battle game. Demo [here](https://www.elfedyrodriguez.com/games/tanks/)

## Building
Run `build.sh`

## Development
### Watching files
A file watcher (Mac OS only) that detects changes in files and rebuilds the project can be started by running
    
    node dev/watch.js

### Serving via HTTP
As browsers won't load images that are not served via http, a dev web server can be run on the desired port by running

    node dev/server.js ./build <PORT>
