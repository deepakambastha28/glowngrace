#!/usr/bin/env node
/**
 * Glow & Grace — local development database helper.
 *
 * Wraps `docker compose` for local-dev/docker-compose.yml so the app can run
 * against a Docker-Postgres instead of Neon (USE_LOCAL_DB=true). Locates the
 * docker CLI even when it is not on PATH (Docker Desktop on Windows installs
 * it under the user's AppData, not Program Files).
 *
 *   node scripts/local-db.mjs up        start the database container
 *   node scripts/local-db.mjs down      stop it (data stays in the volume)
 *   node scripts/local-db.mjs restart   restart the container
 *   node scripts/local-db.mjs logs      follow the container logs
 *   node scripts/local-db.mjs ps        show container status
 *   node scripts/local-db.mjs reset     stop + wipe data volume (start fresh)
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { env, exit } from "node:process";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const COMPOSE_FILE = join("local-dev", "docker-compose.yml");

const KNOWN_DOCKER_PATHS = [
  "C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe",
  join(homedir(), "AppData", "Local", "Programs", "DockerDesktop", "resources", "bin", "docker.exe"),
  "/Applications/Docker.app/Contents/Resources/bin/docker",
  "/usr/local/bin/docker",
  "/usr/bin/docker",
];

function candidateDockerPaths() {
  const paths = [];
  if (env.DOCKER_PATH) paths.push(env.DOCKER_PATH);
  if (env.PATH) {
    for (const dir of env.PATH.split(/[;:]/).filter(Boolean)) {
      if (!dir) continue;
      paths.push(join(dir, "docker.exe"));
      paths.push(join(dir, "/docker"));
    }
  }
  for (const p of KNOWN_DOCKER_PATHS) {
    if (!paths.includes(p)) paths.push(p);
  }
  return paths.filter(Boolean);
}

function findDocker() {
  for (const candidate of candidateDockerPaths()) {
    if (candidate !== "docker" && !existsSync(candidate)) continue;
    try {
      const check = spawnSync(candidate, ["version", "--format", "{{.Client.Version}}"], {
        encoding: "utf8",
        timeout: 15000,
        windowsHide: true,
      });
      if (check.status === 0 && /^\d+\.\d+/.test((check.stdout || "").trim())) {
        return candidate;
      }
    } catch {
      // try the next candidate
    }
  }
  throw new Error(
    "Docker CLI not found. Install Docker Desktop, keep it running, and either add it to PATH or set DOCKER_PATH."
  );
}

function composeArgs(...rest) {
  return ["compose", "-f", COMPOSE_FILE, ...rest];
}

function runSync(docker, args, opts) {
  const result = spawnSync(docker, args, {
    cwd: opts?.cwd,
    stdio: "inherit",
    encoding: "utf8",
    windowsHide: true,
  });
  if (result.status !== 0) exit(result.status ?? 1);
}

function runForeground(docker, args, opts) {
  const child = spawn(docker, args, { cwd: opts?.cwd, stdio: "inherit", windowsHide: true });
  child.on("exit", (code) => exit(code ?? 0));
}

function requireDocker() {
  const docker = findDocker();
  console.log(`\nUsing docker: ${docker}\n`);
  return docker;
}

const USAGE = `Usage: node scripts/local-db.mjs <up|down|restart|logs|ps|reset>`;

async function main() {
  const command = process.argv[2];
  if (!command) {
    console.error(USAGE);
    exit(1);
  }

  const docker = requireDocker();
  const cwd = ROOT;

  switch (command) {
    case "up":
      runSync(docker, composeArgs("up", "-d", "--wait"), { cwd });
      runSync(docker, composeArgs("ps"), { cwd });
      console.log(
        "\nLocal Postgres is ready.\n" +
        `  - URL:  postgresql://${env.LOCAL_DB_USER || "gg"}:${env.LOCAL_DB_PASSWORD || "gg"}` +
        `@localhost:${env.LOCAL_DB_PORT || "5433"}/${env.LOCAL_DB_NAME || "glowngrace"}\n` +
        "  - App  : USE_LOCAL_DB=true in .env.local points the app here.\n" +
        "  - Next : run `npm run start:local` (or `npm run dev`).\n"
      );
      break;
    case "down":
      runSync(docker, composeArgs("down"), { cwd });
      break;
    case "restart":
      runSync(docker, composeArgs("restart"), { cwd });
      runSync(docker, composeArgs("ps"), { cwd });
      break;
    case "logs":
      runForeground(docker, composeArgs("logs", "-f", "--tail=100"), { cwd });
      break;
    case "ps":
      runSync(docker, composeArgs("ps"), { cwd });
      break;
    case "reset":
      runSync(docker, composeArgs("down", "-v"), { cwd });
      console.log("\nLocal Postgres volume wiped. Run `npm run db:up` to start fresh.\n");
      break;
    default:
      console.error(USAGE);
      exit(1);
  }
}

main();