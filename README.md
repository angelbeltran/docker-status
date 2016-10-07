## Docker-Status
A tool that generates cron jobs for logging updates to containers running in a docker instance.

# Example

```javascript
let dockerStatus = require('docker-status')
let job = dockerStatus({ host: <host>, port: <port> })

job.start()
```
