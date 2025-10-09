#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

function resolveContextPath(argv) {
  const fileFlagIndex = argv.indexOf('--file')
  if (fileFlagIndex !== -1 && argv[fileFlagIndex + 1]) {
    return path.resolve(argv[fileFlagIndex + 1])
  }

  if (process.env.ARRONLINK_CONTEXT_PATH) {
    return path.resolve(process.env.ARRONLINK_CONTEXT_PATH)
  }

  return path.resolve(__dirname, '..', 'arronlink-context.json')
}

function loadExistingContext(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(raw)
  } catch (err) {
    return {}
  }
}

function runGit(command) {
  try {
    const output = execSync(command, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
    return output || undefined
  } catch (err) {
    return undefined
  }
}

function collectAutoContext() {
  const branch = runGit('git rev-parse --abbrev-ref HEAD')
  const repoPath = runGit('git rev-parse --show-toplevel')
  const lastCommit = runGit('git rev-parse HEAD')
  const context = { branch, repoPath, lastCommit }
  if (repoPath && !context.repo) context.repo = repoPath
  if (lastCommit && !context.commit) context.commit = lastCommit
  return context
}

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (!arg.startsWith('--')) continue
    const key = arg.slice(2)
    if (key === 'auto') {
      args.auto = true
      continue
    }
    if (key === 'file') {
      i += 1
      continue
    }
    const value = argv[i + 1]
    if (!value || value.startsWith('--')) {
      throw new Error(`Expected value after --${key}`)
    }
    args[key] = value
    i += 1
  }
  return args
}

function ensureDirExists(filePath) {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function applyAliases(next) {
  if (next.projectName && !next.project) next.project = next.projectName
  if (next.project && !next.projectName) next.projectName = next.project

  if (next.repoPath && !next.repo) next.repo = next.repoPath
  if (next.repo && !next.repoPath) next.repoPath = next.repo

  if (next.lastCommit && !next.commit) next.commit = next.lastCommit
  if (next.commit && !next.lastCommit) next.lastCommit = next.commit
}

function main() {
  const argv = process.argv.slice(2)
  const filePath = resolveContextPath(argv)
  const args = parseArgs(argv)
  const existing = loadExistingContext(filePath)

  const next = { ...existing }

  if (args.auto) {
    const autoContext = collectAutoContext()
    Object.assign(next, autoContext)
    if (!next.projectName && !next.project) {
      try {
        const pkgPath = path.resolve(__dirname, '..', 'package.json')
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
        if (pkg.name) {
          next.projectName = pkg.name
          next.project = pkg.name
        }
      } catch (err) {
        // ignore
      }
    }
  }

  const mapping = {
    project: 'projectName',
    projectName: 'projectName',
    repo: 'repoPath',
    repoPath: 'repoPath',
    branch: 'branch',
    commit: 'lastCommit',
    lastCommit: 'lastCommit'
  }

  Object.entries(args).forEach(([key, value]) => {
    if (key === 'auto') return
    if (!Object.prototype.hasOwnProperty.call(mapping, key)) {
      throw new Error(`Unknown option --${key}`)
    }
    next[mapping[key]] = value
    if (key === 'project') next.project = value
    if (key === 'repo') next.repo = value
    if (key === 'commit') next.commit = value
  })

  applyAliases(next)

  next.updatedAt = new Date().toISOString()

  ensureDirExists(filePath)
  fs.writeFileSync(filePath, JSON.stringify(next, null, 2) + '\n', 'utf8')
  console.log(`ArronLink context written to ${filePath}`)
}

try {
  main()
} catch (err) {
  console.error(err.message)
  process.exit(1)
}
