import { spawn } from 'node:child_process'
import process from 'node:process'

const command = process.platform === 'win32' ? 'npm.cmd' : 'npm'

const child = spawn(command, ['run', 'package'], {
  cwd: new URL('../main', import.meta.url),
  stdio: 'inherit'
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 1)
})

child.on('error', (err) => {
  console.error(err)
  process.exit(1)
})
