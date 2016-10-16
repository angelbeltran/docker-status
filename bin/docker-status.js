#!/usr/bin/env node
'use strict'

let fs            = require('fs')
let path          = require('path')
let yargs         = require('yargs')
let dockerStatus  = require('..')


// TODO: define the options' aliases (only obvious ones)
let argv = yargs
  .usage('Usage: docker-status [options]')
  .help('h')
  .describe('protocol', 'docker protocol (http or https)')
  .describe('host', 'docker host ip')
  .describe('port', 'docker port')
  .describe('ca', 'docker certificate authority (ca) file path') // TODO we should make these just have to be paths
  .describe('cert', 'docker TLS certificate file path')          //
  .describe('key', 'docker TLS key file path')                   //
  .describe('cronTime', 'the time to fire off your job. this can be in the form of cron syntax. http://crontab.org/')
  .describe('timeZone', 'specify the timezone for the execution')
  .describe('runOnInit', 'immediately check the status of the docker containers')
  .describe('existing', 'log the existing containers upon start up')
  .describe('file', 'the path of the file to save output to')
  .describe('colored', 'colored output in file, per ANSI escape codes')
  .argv
let options = {}
let dockerOptions = {}
let cronOptions = {}
let logOptions = {}

// insist only providing colored option with a file name
if (argv.colored && !argv.file) {
  throw new Error('Color specified, but no file name.')
}

// resolve file paths (ca, cert, key)
'ca cert key'.split(' ').forEach((opt) => {
  if (argv[opt] !== undefined) {
    console.log('opt:', opt, argv[opt])
    argv[opt] = fs.readFileSync(path.resolve(argv[opt])).toString()
  }
})

// get logging options
'file colored'.split(' ').forEach((opt) => {
  if (argv[opt] !== undefined) {
    logOptions[opt] = argv[opt]
    delete argv[opt]
  }
})

// get cron job options
'cronTime start timeZone'.split(' ').forEach((option) => {
  if (argv[option] !== undefined) {
    cronOptions[option] = argv[option]
  }
})

// get docker options
'protocol host port ca cert key'.split(' ').forEach((option) => {
  if (argv[option] !== undefined) {
    dockerOptions[option] = argv[option]
  }
})

// append non-empty options to the docker-status options and begin cron job
if (Object.keys(dockerOptions).length) {
  options.docker = dockerOptions
}
if (Object.keys(cronOptions).length) {
  options.cron = cronOptions
}
if (Object.keys(logOptions).length) {
  options.log = logOptions
}

let job = dockerStatus(options)

job.start()
