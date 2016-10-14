'use strict'

let Docker = require('dockerode')
let CronJob = require('cron').CronJob
let _ = require('lodash')
let colors = require('colors/safe')
let inspect = require('util').inspect
let printf = require('util').format
let fs = require('fs')
let path = require('path')

/*
  Container Data Example:
{
  Names: [ 'my-mongo' ],
  Image: 'mongo:latest',
  ImageID: 'some-image-id',
  Command: '/entrypoint.sh mongod',
  Created: 1472666065,
  Ports: [ [Object] ],
  Labels: { 'some-label': '1234567890edcb8fd793c8ec3f10a8a4b21c200b121a37d5929121234567890' },
  State: 'running',
  Status: 'Up 5 days',
  HostConfig: { NetworkMode: 'some-network' },
  NetworkSettings: { Networks: [Object] },
  Mounts: [ [Object], [Object] ] } ]
}
*/

// returns a cron job to be started by: require('docker-status')(options).start()
module.exports = function (options) {
  options = options || {}
  let cron = options.cron || '*/1 * * * * *'
  let logFile = options.log || ''
  let docker = new Docker(options.docker)
  let prevContainers = []

  function handleContainerUpdates (err, currContainers) {
    if (err) {
      throw err
    }
    if (!currContainers) {  // TODO: removed this if we find that currContainers is only null when there is an error
      currContainers = []
    }

    let updates = []
    let continuedContainerIds = []

    // look for new containers matching the old ones, and find the diffs
    prevContainers.forEach(function (container) {
      let match
      let containerUpdates

      for (let i = 0; i < currContainers.length; i++) {
        if (container.Id === currContainers[i].Id) {
          match = currContainers[i]
          break
        }
      }
      if (!match) {
        containerUpdates = { removed: container } // mark removed containers as removed
      } else {
        containerUpdates = compareContainers(container, match)
        if (containerUpdates) {
          containerUpdates.Id = container.Id
          containerUpdates = {
            diffs: containerUpdates
          }
        }
        continuedContainerIds.push(container.Id)
      }

      if (containerUpdates) {
        updates.push(containerUpdates)
      }
    })

    // note which containers are new, and push them onto the updates list
    let newContainers = []
    let isNew = true

    for (let i = 0; i < currContainers.length; i++) {
      isNew = true

      for (let j = 0; j < continuedContainerIds.length; j++) {
        if (currContainers[i].Id === continuedContainerIds[j]) {
          isNew = false
          break
        }
      }

      if (isNew) {
        newContainers.push(currContainers[i])
      }
    }

    updates = updates.concat(newContainers.map((c) => ({ added: c })))

    // log the updates
    logUpdates(updates, { file: logFile })

    // mark the current containers as previous containers for the next iteration
    prevContainers = currContainers.slice(0)
  }

  // cron job that handles updates in the docker container space
  return new CronJob(cron, function () {
    docker.listContainers(handleContainerUpdates)
  })
}

// returns { ... }
function compareContainers (a, b) {
  let updates = {}
  let nameUpdates = compareNames(a.Names, b.Names)
  let imageUpdates = compareImages(a.Image, b.Image)
  let imageIdUpdates = compareImageIds(a.ImageID, b.ImageID)
  let commandUpdates = compareCommands(a.Command, b.Command)
  let portUpdates = comparePorts(a.Ports, b.Ports)
  let labelUpdates = compareLabels(a.Labels, b.Labels)
  let stateUpdates = compareStates(a.State, b.State)

  if (nameUpdates) {
    updates.Names = nameUpdates
  }
  if (imageUpdates) {
    updates.Images = imageUpdates
  }
  if (imageIdUpdates) {
    updates.ImageId = imageIdUpdates
  }
  if (commandUpdates) {
    updates.Command = commandUpdates
  }
  if (portUpdates) {
    updates.Ports = portUpdates
  }
  if (labelUpdates) {
    updates.Labels = labelUpdates
  }
  if (stateUpdates) {
    let statusUpdates = compareStatuses(a.Status, b.Status)

    updates.State = stateUpdates
    updates.Status = statusUpdates
  }

  return Object.keys(updates).length ? updates : undefined
}

// returns { removed: [...], added: [...] }
function compareNames (a, b) {
  return updateDifference(a, b)
}

function compareImages (a, b) {
  return a === b ? undefined : { prev: a, curr: b }
}

function compareImageIds (a, b) {
  return a === b ? undefined : { prev: a, curr: b }
}

function compareCommands (a, b) {
  return a === b ? undefined : { prev: a, curr: b }
}

function comparePorts (a, b) {
  return updateDifference(a, b)
}

function compareLabels (a, b) {
  let aLabels = Object.keys(a).map((k) => {
    let label = {}

    label[k] = a[k]
    return label
  })
  let bLabels = Object.keys(b).map((k) => {
    let label = {}

    label[k] = b[k]
    return label
  })

  let updates = updateDifference(aLabels, bLabels)

  if (!updates) {
    return undefined
  }

  // updates.removed = _.merge.apply(null, updates.removed)
  // updates.added = _.merge.apply(null, updates.added)
  // FOR consistency of keys, for now
  updates.prev = _.merge.apply(null, updates.prev)
  updates.curr = _.merge.apply(null, updates.curr)

  return updates
}

function compareStates (a, b) {
  return a === b ? undefined : { prev: a, curr: b }
}

function compareStatus (a, b) {
  return { prev: a, curr: b }
}

function updateDifference (a, b) {
  let symettricDifference = _.xorWith(a, b, _.isEqual)
  let removed = []
  let added = []

  symettricDifference.forEach((name) => {
    if (_.includes(a, name)) {
      removed.push(name)
    } else {
      added.push(name)
    }
  })

  // return (removed.length || added.length) ? { removed: removed, added: added } : undefined
  // FOR consistency of keys, for now
  return (removed.length || added.length) ? { prev: removed, curr: added } : undefined
}

function logUpdates (updates, options) {
  let time = (new Date()).toString()
  let diffUpdates = bundleUpdates(updates, 'diffs')
  let removalUpdates = bundleUpdates(updates, 'removed')
  let addUpdates = bundleUpdates(updates, 'added')
  let updateString = ''

  if (diffUpdates.length || removalUpdates.length || addUpdates.length) {
    console.log('-- updates: %s --', time)
    updateString += printf('-- updates: %s --', time)
  }

  if (diffUpdates.length) {
    diffUpdates.forEach((update) => {
      console.log('diffs to %s', update.Id)
      updateString += '\n' + printf('diffs to %s', update.Id)
      Object.keys(update).forEach((key) => {
        if (key === 'Id') {
          return
        }
        console.log('  %s %s -> %s', key, update[key].prev, update[key].curr)
        updateString += '\n' + printf('  %s %s -> %s', key, update[key].prev, update[key].curr)
      })
    })
  }

  if (removalUpdates.length) {
    console.log('removals:')
    updateString += '\n' + printf('removals:')
    removalUpdates.forEach((update) => {
      console.log(prepareColoredLogString(update))
      updateString += '\n' + prepareLogString(update)
    })
  }

  if (addUpdates.length) {
    console.log('additions:')
    updateString += '\n' + printf('additions:')
    addUpdates.forEach((update) => {
      console.log(prepareColoredLogString(update))
      updateString += '\n' + prepareLogString(update)
    })
  }

  if (updateString) {
    if (options.file) {
      fs.appendFileSync(path.resolve(options.file), updateString, 'utf-8')
    }
  }
}

// bundles all updates in an array of updates that contain a given property into an array nested in one update object
function bundleUpdates (updates, prop) {
  return updates.reduce((acc, update) => {
    if (update.hasOwnProperty(prop)) {
      acc.push(update[prop])
    }
    return acc
  }, [])
}

function prepareLogString (a) {
  return inspect(a, { depth: 6 })
    .split('\n')
    .map((s) => '  ' + s)
    .join('\n')
}

function prepareColoredLogString (a) {
  return inspect(a, { depth: 6, colors: true })
    .split('\n')
    .map((s) => '  ' + s)
    .join('\n')
    .replace(/( )Names(: )/, '$1' + colors.cyan('Names') + ': ')
    .replace(/( )Image(: )/, '$1' + colors.cyan('Image') + ': ')
}
