#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

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

function loadContext(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8')
    const parsed = JSON.parse(raw)
    return parsed
  } catch (err) {
    if (err.code === 'ENOENT') {
      return null
    }
    throw err
  }
}

function main() {
  const argv = process.argv.slice(2)
  const filePath = resolveContextPath(argv)
  const context = loadContext(filePath)
  if (!context) {
    console.error(`No ArronLink context found at ${filePath}`)
    process.exitCode = 1
    return
  }

  if (argv.includes('--pretty')) {
    console.log('ArronLink Context')
    Object.entries(context).forEach(([key, value]) => {
      console.log(` - ${key}: ${value}`)
    })
    return
  }

  process.stdout.write(JSON.stringify(context, null, 2))
}

try {
  main()
} catch (err) {
  console.error(err.message)
  process.exit(1)
}
