# Docker-Status

A tool for logging docker container information.

## Install

```
npm install docker-status
```

## Package

This package exports a function the produces a configurable [cron job](https://github.com/ncb000gt/node-cron).
This cron job checks for updates in a docker instance's running containers.
When changes occur in the state of the containers, those changes are logged nicely.

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

// ...

job.stop() // end the job
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


## Examples

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

Here's a simple example of a cron job instantiated inside the nodejs repl.

```javascript
> var dockerStatus = require('docker-status')
undefined
> var job = dockerStatus()
undefined
> job.start()
undefined
> -- updates: Fri Oct 14 2016 17:49:06 GMT-0600 (MDT) --
additions:
  { Id: '01fd7133602ce163775572256992fb1abc8afb6a630fa016e5910c63ca76be50',
    Names: [ '/mymongo' ],
    Image: 'mongo',
    ImageID: 'sha256:1234567891234567891234567891234567891234567891234567891234567891',
    Command: '/entrypoint.sh mongod',
    Created: 1467825206,
    Ports:
     [ { IP: '127.0.0.1',
         PrivatePort: 27017,
         PublicPort: 27017,
         Type: 'tcp' } ],
    Labels: {},
    State: 'running',
    Status: 'Up 15 minutes',
    HostConfig: { NetworkMode: 'default' },
    NetworkSettings:
     { Networks:
        { bridge:
           { IPAMConfig: null,
             Links: null,
             Aliases: null,
             NetworkID: '7c4ab17fc688ef1a85e2d59b62d3f5c2a75476280f9ca3e3cefb5750d6d20ab9',
             EndpointID: 'ab549fe611a70bd841534a9c634cd2e3f9e9abf8218cf9204f04151e62e84b66',
             Gateway: '172.17.0.1',
             IPAddress: '172.17.0.2',
             IPPrefixLen: 16,
             IPv6Gateway: '',
             GlobalIPv6Address: '',
             GlobalIPv6PrefixLen: 0,
             MacAddress: '02:42:ac:11:00:02' } } },
    Mounts:
     [ { Name: '40ec6ba4e6d29252acb5a79b5132283c0acc8a6215bfed62009a73093e2bed07',
         Source: '/var/lib/docker/volumes/40ec6ba4e6d29252acb5a79b5132283c0acc8a6215bfed62009a73093e2bed07/_data',
         Destination: '/data/configdb',
         Driver: 'local',
         Mode: '',
         RW: true,
         Propagation: '' },
       { Name: '3e51e9fc3327417f1fe84dcbc911046754726dd3c2ff6035db1e1128198beb26',
         Source: '/var/lib/docker/volumes/3e51e9fc3327417f1fe84dcbc911046754726dd3c2ff6035db1e1128198beb26/_data',
         Destination: '/data/db',
         Driver: 'local',
         Mode: '',
         RW: true,
         Propagation: '' } ] }
-- updates: Fri Oct 14 2016 17:49:20 GMT-0600 (MDT) --
additions:
  { Id: 'e92feff15478270f98b824c93015342a75f4e64f315cdd69fe0c0f776c51e464',
    Names: [ '/romantic_archimedes' ],
    Image: 'hello-world',
    ImageID: 'sha256:1234567891234567891234567891234567891234567891234567891234567891',
    Command: '/hello',
    Created: 1476488957,
    Ports: [],
    Labels: {},
    State: 'running',
    Status: 'Up Less than a second',
    HostConfig: { NetworkMode: 'default' },
    NetworkSettings:
     { Networks:
        { bridge:
           { IPAMConfig: null,
             Links: null,
             Aliases: null,
             NetworkID: '7c4ab17fc688ef1a85e2d59b62d3f5c2a75476280f9ca3e3cefb5750d6d20ab9',
             EndpointID: '25fe13dee67670185b2fd5789b4d227393f3b9f3d43d9a7cd4c5b7b85240cd0d',
             Gateway: '165.15.0.1',
             IPAddress: '165.15.0.3',
             IPPrefixLen: 16,
             IPv6Gateway: '',
             GlobalIPv6Address: '',
             GlobalIPv6PrefixLen: 0,
             MacAddress: '02:42:ac:11:00:03' } } },
    Mounts: [] }
-- updates: Fri Oct 14 2016 17:49:21 GMT-0600 (MDT) --
removals:
  { Id: 'e92feff15478270f98b824c93015342a75f4e64f315cdd69fe0c0f776c51e464',
    Names: [ '/romantic_archimedes' ],
    Image: 'hello-world',
    ImageID: 'sha256:c54a2cc56cbb2f04003c1cd4507e118af7c0d340fe7e2720f70976c4b75237dc',
    Command: '/hello',
    Created: 1476488957,
    Ports: [],
    Labels: {},
    State: 'running',
    Status: 'Up Less than a second',
    HostConfig: { NetworkMode: 'default' },
    NetworkSettings:
     { Networks:
        { bridge:
           { IPAMConfig: null,
             Links: null,
             Aliases: null,
             NetworkID: '7c4ab17fc688ef1a85e2d59b62d3f5c2a75476280f9ca3e3cefb5750d6d20ab9',
             EndpointID: '25fe13dee67670185b2fd5789b4d227393f3b9f3d43d9a7cd4c5b7b85240cd0d',
             Gateway: '165.17.0.1',
             IPAddress: '165.17.0.3',
             IPPrefixLen: 16,
             IPv6Gateway: '',
             GlobalIPv6Address: '',
             GlobalIPv6PrefixLen: 0,
             MacAddress: '02:42:ac:11:00:03' } } },
    Mounts: [] }
-- updates: Fri Oct 14 2016 18:24:27 GMT-0600 (MDT) --
diffs to 8145e9a12cfcca3afcd00bd05587635f3668c553f73d9f1b59e120d09d11497e
  State: running -> exited
  Status: Up Less than a second -> Exited (0) 1 seconds ago
```
