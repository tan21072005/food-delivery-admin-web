import assert from "node:assert/strict";
import { spawn } from "node:child_process";

const port = Number(process.env.SMOKE_PORT ?? 3210);
const origin = `http://127.0.0.1:${port}`;

function startServer() {
  const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
    env: {
      ...process.env,
      PORT: String(port),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let output = "";
  server.stdout.on("data", (chunk) => {
    output += chunk.toString();
  });
  server.stderr.on("data", (chunk) => {
    output += chunk.toString();
  });

  return { server, getOutput: () => output };
}

async function waitForServer(getOutput) {
  const deadline = Date.now() + 20000;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${origin}/login`, { redirect: "manual" });

      if (response.status === 200) {
        return;
      }
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Next server did not become ready. ${lastError?.message ?? ""}\n${getOutput()}`);
}

async function expectOk(pathname) {
  const response = await fetch(`${origin}${pathname}`, { redirect: "manual" });
  assert.equal(response.status, 200, `${pathname} should return 200`);
}

async function expectRedirect(pathname, destination) {
  const response = await fetch(`${origin}${pathname}`, { redirect: "manual" });
  assert.equal(response.status, 307, `${pathname} should redirect`);
  assert.equal(new URL(response.headers.get("location")).pathname, destination);
}

async function runSmoke() {
  const { server, getOutput } = startServer();

  try {
    await waitForServer(getOutput);

    await expectOk("/login");
    await expectOk("/signup");
    await expectOk("/seller/apply");
    await expectOk("/unauthorized");

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      await expectRedirect("/admin/dashboard", "/login");
      await expectRedirect("/seller/dashboard", "/login");
    }
  } finally {
    server.kill();
  }
}

await runSmoke();
