const { spawn } = require('child_process');

console.log('[Supervisor] Initializing ModernMint production process supervisor...');

// Retrieve public port (assigned by Render) and default to 5000 / 3001 if omitted
const publicPort = process.env.PORT || '3001';
console.log(`[Supervisor] Public Express API port target: ${publicPort}`);
console.log('[Supervisor] Internal Next.js port target: 3000');

let frontendProcess = null;
let backendProcess = null;
let exiting = false;

// Gracefully terminate child processes
function cleanExit(code) {
  if (exiting) return;
  exiting = true;
  console.log(`[Supervisor] Shutting down all services with exit code ${code}...`);

  if (frontendProcess) {
    console.log('[Supervisor] Terminating Next.js frontend process...');
    frontendProcess.kill('SIGTERM');
  }

  if (backendProcess) {
    console.log('[Supervisor] Terminating Express backend process...');
    backendProcess.kill('SIGTERM');
  }

  // Brief delay to allow cleanup before exiting supervisor
  setTimeout(() => {
    process.exit(code);
  }, 1000);
}

// 1. Spawn Next.js Frontend (Runs internally on port 3000)
const frontendEnv = {
  ...process.env,
  PORT: '3000',
  HOSTNAME: '127.0.0.1' // Bind Next.js only to localhost internally
};

console.log('[Supervisor] Spawning Next.js frontend on localhost:3000...');
frontendProcess = spawn('npm', ['run', 'start', '--prefix', 'frontend'], {
  env: frontendEnv,
  shell: true
});

frontendProcess.stdout.on('data', (data) => {
  process.stdout.write(`[Frontend] ${data.toString()}`);
});

frontendProcess.stderr.on('data', (data) => {
  process.stderr.write(`[Frontend ERROR] ${data.toString()}`);
});

frontendProcess.on('exit', (code, signal) => {
  console.log(`[Supervisor] Next.js frontend exited with code: ${code}, signal: ${signal}`);
  cleanExit(code !== 0 ? code : 1);
});

// 2. Spawn Express Backend (Runs publicly on PORT / default 3001)
const backendEnv = {
  ...process.env,
  PORT: publicPort
};

console.log(`[Supervisor] Spawning Express backend on port ${publicPort}...`);
backendProcess = spawn('npm', ['run', 'start', '--prefix', 'backend'], {
  env: backendEnv,
  shell: true
});

backendProcess.stdout.on('data', (data) => {
  process.stdout.write(`[Backend] ${data.toString()}`);
});

backendProcess.stderr.on('data', (data) => {
  process.stderr.write(`[Backend ERROR] ${data.toString()}`);
});

backendProcess.on('exit', (code, signal) => {
  console.log(`[Supervisor] Express backend exited with code: ${code}, signal: ${signal}`);
  cleanExit(code !== 0 ? code : 1);
});

// Bind system signal listeners for graceful shutdown
process.on('SIGINT', () => {
  console.log('[Supervisor] Received SIGINT signal.');
  cleanExit(0);
});

process.on('SIGTERM', () => {
  console.log('[Supervisor] Received SIGTERM signal.');
  cleanExit(0);
});
