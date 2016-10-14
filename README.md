# Docker-Status

A tool that generates cron jobs for logging updates to containers running in a docker instance.

```javascript
// Simple example: connect to local docker instance
let dockerStatus = require('docker-status')
let job = dockerStatus()

job.start()

// ...

// Defined docker address
let dockerStatus = require('docker-status')
let job = dockerStatus({ docker: { host: <host>, port: <port> } })

job.start()
```

## Install

```
npm install docker-status
```

## Configuration

Below is the form options specified to the package take

```javascript
{
  [docker]: Object,     // dockerode options object
  [cron]: Object,       // cron options object
  [log]: {
    file: String,       // file to save logs in
    [colored]: Boolean  // colored output in file
  }
}
```

For more information on the [dockerode](https://github.com/apocas/dockerode) or [cron job](https://github.com/ncb000gt/node-cron) options please visit their respective repos.

If you'd like to specify a file to log output, provide the name of the file, absolute or relative, at ```log.file```. If you'd like the file to have [colored](https://github.com/Marak/colors.js) like the console, set ```log.colored``` to ```true```.

## Example

```javascript
let dockerStatus = require('docker-status')
let job = dockerStatus({
  docker: { host: <host>, port: <port> },
  cron: { cronTime: '*/10 * 8-20 * * 1-5', onTick: function (containers, updates) { ... } },
  log: { file: 'docker-status.log', colored: true }
 })

job.start()
```

The above instance will log changes to the docker container space specified at \<host>:\<port> on weekdays from 8am to 8pm at 10 second intervals. The function specified at ```cron.onTick``` in the options object will be called with the list of current ```container``` data and list of ```updates```. The file, 'docker-status.log', will be appended with all logs, colored per ANSI escape codes.
