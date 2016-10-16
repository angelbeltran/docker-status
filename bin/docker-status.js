#!/usr/bin/env node
'use strict'

let yargs = require('yargs')
let dockerStatus = require('..')


let argv = yargs
  .usage('Usage: $0 --docker=[options] --cron=[options] --file [file] --colored')
  .argv
let options = {}

if (argv.colored && !argv.file) {
  throw new Error('Color specified, but no file name.')
}
if (argv.file) {
  options.log = { file: argv.file }
}
if (argv.colored) {
  options.log.colored = argv.colored
}
if (argv.docker) {
  options.docker = yargs.parse(argv.docker)
  delete options.docker._
  delete options.docker.$0
}
if (argv.cron) {
  options.cron = yargs.parse(argv.cron)
  delete options.cron._
  delete options.cron.$0
}


let job = dockerStatus(options)

job.start()
