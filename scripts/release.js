import minimist from 'minimist'
import enquirer from 'enquirer'
import semver from 'semver'
import pico from 'picocolors'
import { execa } from 'execa'
import { createRequire } from 'node:module'
const { prompt } = enquirer

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'


let versionUpdated = false

const currentVersion = createRequire(import.meta.url)('../src/package.json').version
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const preId = semver.prerelease(currentVersion)?.[0]

const args = minimist(process.argv.slice(2),{})
const isDryRun = args.dry

const step = (msg) => console.log(pico.cyan(msg))
const run = async (bin, args, opts = {}) => execa(bin, args, { stdio: 'inherit', ...opts })
const dryRun = async (bin, args, opts = {}) => console.log(pico.blue(`[dryrun] ${bin} ${args.join(' ')}`), opts)
const runIfNotDry = isDryRun ? dryRun : run

const versionIncrements = [
  'patch',
  'minor',
  'major',
  'prepatch',
  'preminor',
  'premajor',
  'prerelease'
]

const inc = (i) => semver.inc(currentVersion, i, preId)

async function main() {
  if (!(await isInSyncWithRemote())) {
    return
  } else {
    console.log(`${pico.green(`✓`)} commit is up-to-date with remote.\n`)
  }
  step('\nselecting Version...')
  let targetVersion = null
  if (!targetVersion) {
    // no explicit version, offer suggestions
    /** @type {{ release: string }} */
    const { release } = await prompt({
      type: 'select',
      name: 'release',
      message: 'Select release type',
      choices: versionIncrements
        .map(i => `${i} (${inc(i)})`)
        .concat(['custom']),
    })

    if (release === 'custom') {
      /** @type {{ version: string }} */
      const result = await prompt({
        type: 'input',
        name: 'version',
        message: 'Input custom version',
        initial: currentVersion,
      })
      targetVersion = result.version
    } else {
      targetVersion = release.match(/\((.*)\)/)?.[1] ?? ''
    }
  }

  if (!semver.valid(targetVersion)) {
    throw new Error(`invalid target version: ${targetVersion}`)
  }
  const { yes: confirmRelease } = await prompt({
    type: 'confirm',
    name: 'yes',
    message: `Releasing v${targetVersion}. Confirm?`,
  })

  if (!confirmRelease) {
    return
  }

  updateVersions(
    targetVersion,
  )
  versionUpdated = true

  const { stdout } = await run('git', ['diff'], { stdio: 'pipe' })
  if (stdout) {
    step('\nCommitting changes...')
    await runIfNotDry('git', ['add', '-A'])
    await runIfNotDry('git', ['commit', '-m', `release: v${targetVersion}`])
    await runIfNotDry('git', ['tag', `v${targetVersion}`])
  } else {
    console.log('No changes to commit.')
  }
}

async function isInSyncWithRemote() {
  try {
    const branch = await getBranch()
    const res = await fetch(
      `https://api.github.com/repos/viur-framework/vi-vue-utils/commits/${branch}?per_page=1`,
    )
    const data = await res.json()
    if (data.sha === (await getSha())) {
      return true
    } else {
      /** @type {{ yes: boolean }} */
      const { yes } = await prompt({
        type: 'confirm',
        name: 'yes',
        message: pico.red(
          `Local HEAD is not up-to-date with remote. Are you sure you want to continue?`,
        ),
      })
      return yes
    }
  } catch {
    console.error(
      pico.red('Failed to check whether local HEAD is up-to-date with remote.'),
    )
    return false
  }
}

async function getSha() {
  return (await execa('git', ['rev-parse', 'HEAD'])).stdout
}

async function getBranch() {
  return (await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD'])).stdout
}

function updateVersions(version) {
  const pkgPath = path.resolve(path.resolve(__dirname, '..', "src"), 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  pkg.version = version
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  step('\nUpdating package-lock.json...')
  // Run npm install to update package-lock.json
  runIfNotDry('npm', ['install'])
}


main()