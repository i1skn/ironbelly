'use strict'

const fetch = require('node-fetch')
const util = require('util')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const checker = require('license-checker')
const _ = require('lodash')

const additionalPackages = require('./additional-licenses')

const rootDir = path.join(__dirname, `../`)
const packageNameRegexp = /\//g

function sanitizePackageName(packageName) {
  return packageName.replace(packageNameRegexp, '-')
}

async function main() {
  const args = {
    start: rootDir,
    production: true,
    customFormat: {
      name: '',
      url: false,
      version: false,
      description: false,
      licenses: false,
      copyright: false,
      licenseFile: false,
      licenseText: 'none',
      licenseModified: false,
      repository: false,
      publisher: false,
      email: false,
      path: false,
    },
  }

  const pkgs = {
    ...(await util.promisify(checker.init)(args)),
    ...additionalPackages,
  }
  const groupedPkgs = _.groupBy(pkgs, (pkg) => pkg.licenseText)

  const result = {
    licenses: {},
    packages: {},
  }

  let licenseId = 0
  for (const licenseText of Object.keys(groupedPkgs)) {
    result.licenses[licenseId] = licenseText
    for (const pkg of groupedPkgs[licenseText]) {
      result.packages[pkg.name] = licenseId
    }
    licenseId++
  }
  fs.writeFileSync(path.join(rootDir, 'licenses.json'), JSON.stringify(result))
}

main()
