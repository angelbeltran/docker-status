# Docker-Status

A tool for logging docker container information.

## Install

```
npm install docker-status
```

## Package

This npm package exports a function and provides a cli tool that both produce a configurable [cron job](https://github.com/ncb000gt/node-cron).
This cron job checks for updates in a docker instance's running containers.
When changes occur in the state of the containers, those changes are logged nicely.

```javascript
// Simple js example: connect to local docker instance
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

```bash
# Simple bash example
docker-status

# Defined docker address
docker-status --host <host> --port <port>
```


## Configuration

Below is the form config objects passed to the module should take

```javascript
{
  docker: Object,     // dockerode options object
  cron: Object,       // cron options object
  file: String,       // file to save logs in
  colored: Boolean    // colored output in file
  existing: Boolean   // log out existing containers upon start up
}
```

All options are optional. For more information on the [dockerode](https://github.com/apocas/dockerode) or [cron](https://github.com/ncb000gt/node-cron) options please visit the respective [dockerode](https://github.com/apocas/dockerode) or [cron](https://github.com/ncb000gt/node-cron) repositories'.

- To also store output in a file, set ```file``` to the path of that file, absolute or relative. Note this will append to, not overwrite, said file, creating it if needed.

- To allow [colored](https://github.com/Marak/colors.js) output when outputting to file, set ```colored``` to ```true```.

- To log existing containers upon startup, set ```existing``` to true.

Here is a view of the cli tool options with description:

```bash
Usage: docker-status [options]

Options:
  -h           Show help                                               [boolean]
  --protocol   docker protocol (http or https)
  --host       docker host ip
  --port       docker port
  --ca         docker certificate authority (ca) file path
  --cert       docker TLS certificate file path
  --key        docker TLS key file path
  --cronTime   the time to fire off your job. this can be in the form of cron
               syntax. http://crontab.org/
  --timeZone   specify the timezone for the execution
  --runOnInit  immediately check the status of the docker containers
  --existing   log the existing containers upon start up
  --file       the path of the file to save output to
  --colored    colored output in file, per ANSI escape codes
```


## Examples

```javascript
let dockerStatus = require('docker-status')
let job = dockerStatus({
  docker: { host: <host>, port: <port> },
  cron: { cronTime: '*/10 * 8-20 * * 1-5', onTick: function (containers, updates) { ... } },
  file: 'docker-status.log',
  colored: true
 })

job.start()
```

The above instance will log changes to the containers specified at \<host>:\<port> on weekdays from 8am to 8pm at 10 second intervals. The function specified at ```cron.onTick``` in the options object will be called with the list of current ```container``` data and list of ```updates```. The file, 'docker-status.log', will be appended with all logs, colored per ANSI escape codes. The initial state of the containers will not be logged, because ```existing``` was not set to ```true```. When a container's state changes, updates to that container will be logged.

Here's a simple example of this package at work from the command line (without color, sadly).

```
$ node bin/docker-status.js --existing
-- updates: Sun Oct 16 2016 17:57:34 GMT-0600 (MDT) --
additions:
  { Id: '54784f0d0ffa8c36010d90066d46517c377ed16f0e81e87ee4a2e25c21a0bc14',
    Names: [ '/mymongo' ],
    Image: 'mongo',
    ImageID: 'sha256:282fd552add6aa67509775e68e32aeabb2ea88726299367d49e36847c65833b4',
    Command: '/entrypoint.sh mongod',
    Created: 1466477477,
    Ports: 
     [ { IP: '127.0.0.1',
         PrivatePort: 27017,
         PublicPort: 27017,
         Type: 'tcp' } ],
    Labels: {},
    State: 'running',
    Status: 'Up About an hour',
    HostConfig: { NetworkMode: 'default' },
    NetworkSettings: 
     { Networks: 
        { bridge: 
           { IPAMConfig: null,
             Links: null,
             Aliases: null,
             NetworkID: 'eb2d846e772d8492810890bdd93093b375079e8b52514590147353293566b353',
             EndpointID: '263cdcb973267f92d40919d732d53383c9525821bec8c7f7c61a15e6003a2945',
             Gateway: '123.45.0.1',
             IPAddress: '123.45.0.2',
             IPPrefixLen: 16,
             IPv6Gateway: '',
             GlobalIPv6Address: '',
             GlobalIPv6PrefixLen: 0,
             MacAddress: '01:23:ab:45:67:89' } } },
    Mounts: 
     [ { Name: 'dd5e389f4e7d44526d549e743835e86f3272233b134a5d0a8cf022406b45467e',
         Source: '/var/lib/docker/volumes/dd5e389f4e7d44526d549e743835e86f3272233b134a5d0a8cf022406b45467e/_data',
         Destination: '/data/configdb',
         Driver: 'local',
         Mode: '',
         RW: true,
         Propagation: '' },
       { Source: '/home/dude/db',
         Destination: '/data/db',
         Mode: '',
         RW: true,
         Propagation: 'rprivate' } ] }
-- updates: Sun Oct 16 2016 17:57:50 GMT-0600 (MDT) --
additions:
  { Id: '033299d3306a0d7472c454369e3e102c56d946393831cc3c130e77008862e277',
    Names: [ '/hello' ],
    Image: 'hello-world',
    ImageID: 'sha256:c54a2cc56cbb2f04003c1cd4507e118af7c0d340fe7e2720f70976c4b75237dc',
    Command: '/hello',
    Created: 1476662269,
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
             NetworkID: 'eb2d846e772d8492810890bdd93093b375079e8b52514590147353293566b353',
             EndpointID: 'c6f113e6074f40518bdbfaea92e82e6a9aef6b977a602ecbe2f174763f301810',
             Gateway: '123.45.0.1',
             IPAddress: '123.45.0.3',
             IPPrefixLen: 16,
             IPv6Gateway: '',
             GlobalIPv6Address: '',
             GlobalIPv6PrefixLen: 0,
             MacAddress: '01:23:ab:45:67:89' } } },
    Mounts: [] }
-- updates: Sun Oct 16 2016 17:57:50 GMT-0600 (MDT) --
diffs to 033299d3306a0d7472c454369e3e102c56d946393831cc3c130e77008862e277
  State: running -> exited
  Status: Up Less than a second -> Exited (0) Less than a second ago
-- updates: Sun Oct 16 2016 17:57:58 GMT-0600 (MDT) --
removals:
  { Id: '033299d3306a0d7472c454369e3e102c56d946393831cc3c130e77008862e277',
    Names: [ '/hello' ],
    Image: 'hello-world',
    ImageID: 'sha256:c54a2cc56cbb2f04003c1cd4507e118af7c0d340fe7e2720f70976c4b75237dc',
    Command: '/hello',
    Created: 1476662269,
    Ports: [],
    Labels: {},
    State: 'exited',
    Status: 'Exited (0) 7 seconds ago',
    HostConfig: { NetworkMode: 'default' },
    NetworkSettings: 
     { Networks: 
        { bridge: 
           { IPAMConfig: null,
             Links: null,
             Aliases: null,
             NetworkID: 'eb2d846e772d8492810890bdd93093b375079e8b52514590147353293566b353',
             EndpointID: '',
             Gateway: '',
             IPAddress: '',
             IPPrefixLen: 0,
             IPv6Gateway: '',
             GlobalIPv6Address: '',
             GlobalIPv6PrefixLen: 0,
             MacAddress: '' } } },
    Mounts: [] }
```
