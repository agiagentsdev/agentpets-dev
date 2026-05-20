#!/usr/bin/env node
var Yz = Object.create;
var { getPrototypeOf: Gz, defineProperty: u, getOwnPropertyNames: Vz } = Object;
var Kz = Object.prototype.hasOwnProperty;
function Bz(z) {
  return this[z];
}
var Hz,
  Mz,
  kz = (z, W, $) => {
    var J = z != null && typeof z === "object";
    if (J) {
      var Q = W ? (Hz ??= new WeakMap()) : (Mz ??= new WeakMap()),
        Z = Q.get(z);
      if (Z) return Z;
    }
    $ = z != null ? Yz(Gz(z)) : {};
    const Y =
      W || !z || !z.__esModule
        ? u($, "default", { value: z, enumerable: !0 })
        : $;
    for (const K of Vz(z))
      if (!Kz.call(Y, K)) u(Y, K, { get: Bz.bind(z, K), enumerable: !0 });
    if (J) Q.set(z, Y);
    return Y;
  };
var Wz = require("node:child_process"),
  w = require("node:crypto"),
  V = require("node:fs"),
  m = kz(require("node:http")),
  f = require("node:os"),
  H = require("node:path");
var T = "running-left";
function E() {
  const z = T;
  return (T = z === "running-left" ? "running-right" : "running-left"), z;
}
var Fz = {
  minDwellMs: 250,
  maxQueueSize: 50,
  durationStates: new Set(["waving", "failed", "review", "jumping"]),
};
class h {
  opts;
  pending = [];
  displayed = null;
  constructor(z = {}) {
    this.opts = { ...Fz, ...z };
  }
  enqueue(z) {
    if (this.coalesces(z)) return !1;
    this.pending.push(z);
    while (this.pending.length > this.opts.maxQueueSize) this.pending.shift();
    return !0;
  }
  coalesces(z) {
    if (this.displayed && this.displayed.state === z.state) {
      if (z.receivedAt - this.displayed.shownAt < this.displayed.duration)
        return !0;
    }
    if (this.pending.length === 0) return !1;
    if (this.pending[this.pending.length - 1].state === z.state) return !0;
    return !1;
  }
  tick(z) {
    if (this.displayed) {
      if (z - this.displayed.shownAt < this.displayed.duration) return null;
      this.displayed = null;
    }
    const W = this.pending.shift();
    if (!W) return null;
    return (
      (this.displayed = {
        state: W.state,
        duration: this.dwellFor(W),
        shownAt: z,
      }),
      W
    );
  }
  dwellFor(z) {
    if (this.opts.durationStates.has(z.state) && z.duration)
      return Math.max(z.duration, this.opts.minDwellMs);
    if (z.duration && z.duration > this.opts.minDwellMs) return z.duration;
    return this.opts.minDwellMs;
  }
  pendingLength() {
    return this.pending.length;
  }
  currentDisplayed() {
    return this.displayed ? { ...this.displayed } : null;
  }
}
var F = Number(process.env.PETDEX_PORT ?? 7777),
  C = H.join(f.homedir(), ".petdex", "runtime"),
  $z = H.join(C, "state.json"),
  Jz = H.join(C, "bubble.json"),
  U = H.join(C, "update.json"),
  Zz = H.join(C, "update.log"),
  l = H.join(C, "update-token"),
  p = H.join(f.homedir(), ".petdex", "version"),
  Nz = H.join(C, "sidecar.log"),
  Cz = 65536,
  Oz = "https://api.github.com/repos/agiagentsdev/agentpets-dev/releases",
  i = 30,
  Lz = 5,
  xz = "desktop-v",
  jz = 21600000,
  yz = 30000,
  q = "x-petdex-update-token",
  d = new Set([
    "idle",
    "running",
    "running-left",
    "running-right",
    "waving",
    "jumping",
    "failed",
    "review",
    "waiting",
  ]);
V.mkdirSync(C, { recursive: !0 });
var wz = 30,
  o = 60,
  a = (() => {
    let z = o,
      W = Date.now();
    return {
      consume() {
        const $ = Date.now(),
          J = ($ - W) / 1000;
        if (J > 0) (z = Math.min(o, z + J * wz)), (W = $);
        if (z < 1) return !1;
        return (z -= 1), !0;
      },
    };
  })(),
  j = w.randomBytes(32).toString("hex");
function Dz() {
  try {
    V.writeFileSync(l, j, { mode: 384 }), V.chmodSync(l, 384);
  } catch (z) {
    process.stderr.write(`petdex sidecar: could not persist update token: ${z.message}
`);
  }
}
var s = H.join(f.homedir(), ".petdex", "telemetry.json"),
  bz =
    process.env.PETDEX_TELEMETRY_URL ??
    "https://agentpets.dev/api/telemetry/event",
  n = !1;
function qz() {
  if (process.env.PETDEX_TELEMETRY === "0") return null;
  if (!V.existsSync(s)) return null;
  try {
    const z = JSON.parse(V.readFileSync(s, "utf8"));
    if (typeof z.install_id !== "string") return null;
    if (z.enabled === !1) return null;
    return { install_id: z.install_id, enabled: !0 };
  } catch {
    return null;
  }
}
function Iz(z, W) {
  if (n) return;
  n = !0;
  const $ = qz();
  if (!$) return;
  const J = JSON.stringify({
    install_id: $.install_id,
    event: "desktop_first_state_received",
    state: z,
    agent_source: W,
  });
  fetch(bz, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: J,
    signal: AbortSignal.timeout(2000),
  }).catch(() => {});
}
function I(z, W) {
  const $ = Buffer.from(z),
    J = Buffer.from(W);
  if ($.length !== J.length) return w.timingSafeEqual($, $), !1;
  return w.timingSafeEqual($, J);
}
function X(z) {
  const W = `[${new Date().toISOString()}] ${z}
`;
  try {
    V.appendFileSync(Nz, W);
  } catch {}
  process.stderr.write(W);
}
var L = null,
  r = 0;
function A(z, W) {
  r += 1;
  const $ = {
    state: z,
    duration: W ?? null,
    updatedAt: Date.now(),
    counter: r,
  };
  if ((V.writeFileSync($z, JSON.stringify($)), L)) clearTimeout(L), (L = null);
  if (typeof W === "number" && W > 0 && z !== "idle")
    L = setTimeout(() => {
      A("idle"), (L = null);
    }, W);
}
var _ = new h({ minDwellMs: 250, maxQueueSize: 50 }),
  v = 0;
function Qz(z, W) {
  v += 1;
  const $ = { text: z, agent_source: W, updatedAt: Date.now(), counter: v };
  V.writeFileSync(Jz, JSON.stringify($));
}
setInterval(() => {
  const z = _.tick(Date.now());
  if (z) A(z.state, z.duration);
}, 100).unref();
A("idle");
try {
  Qz("", null);
} catch {}
try {
  const z = k(),
    W = D();
  if (z.status === "available" && (z.current !== W || W === null))
    M({
      available: !1,
      current: W,
      latest: null,
      status: "idle",
      checkedAt: 0,
    }),
      X(
        `cleared stale update.json: persisted.current=${z.current ?? "?"} installed=${W ?? "?"}`,
      );
} catch {}
function G(z, W, $) {
  const J = JSON.stringify($);
  z.writeHead(W, {
    "content-type": "application/json",
    "content-length": Buffer.byteLength(J),
  }),
    z.end(J);
}
async function t(z) {
  return new Promise((W, $) => {
    let J = [],
      Q = 0;
    z.on("data", (Z) => {
      if (((Q += Z.length), Q > Cz)) {
        z.destroy(Error("payload_too_large"));
        return;
      }
      J.push(Z);
    }),
      z.on("end", () => {
        try {
          const Z = Buffer.concat(J).toString("utf8");
          W(Z.length === 0 ? {} : JSON.parse(Z));
        } catch (Z) {
          $(Z);
        }
      }),
      z.on("error", $);
  });
}
function D() {
  if (!V.existsSync(p)) return null;
  try {
    return V.readFileSync(p, "utf8").trim() || null;
  } catch {
    return null;
  }
}
function k() {
  if (!V.existsSync(U))
    return {
      available: !1,
      current: D(),
      latest: null,
      status: "idle",
      checkedAt: 0,
    };
  try {
    return JSON.parse(V.readFileSync(U, "utf8"));
  } catch {
    return {
      available: !1,
      current: D(),
      latest: null,
      status: "idle",
      checkedAt: 0,
    };
  }
}
function M(z) {
  try {
    V.writeFileSync(U, JSON.stringify(z));
  } catch (W) {
    X(`update.json write failed: ${W.message}`);
  }
  if (z.status === "error")
    try {
      _.enqueue({ state: "failed", duration: 3000, receivedAt: Date.now() });
    } catch (W) {
      X(`mascot failed-state enqueue failed: ${W.message}`);
    }
}
async function Pz() {
  for (let z = 1; z <= Lz; z++) {
    const W = `${Oz}?per_page=${i}&page=${z}`,
      $ = await fetch(W, {
        headers: { Accept: "application/vnd.github+json" },
        signal: AbortSignal.timeout(8000),
      });
    if (!$.ok) return X(`update check: GH API ${$.status} on page ${z}`), null;
    const J = await $.json();
    if (!Array.isArray(J) || J.length === 0) return null;
    const Q = J.find(
      (Z) =>
        !Z.draft &&
        !Z.prerelease &&
        typeof Z.tag_name === "string" &&
        Z.tag_name.startsWith(xz),
    );
    if (Q?.tag_name) return Q.tag_name;
    if (J.length < i) return null;
  }
  return null;
}
async function e() {
  let z = D(),
    W = null;
  try {
    W = await Pz();
  } catch (Z) {
    X(`update check failed: ${Z.message}`);
    return;
  }
  if (k().status === "running") return;
  const J = !!W && !!z && W !== z,
    Q = {
      available: J,
      current: z,
      latest: W,
      status: J ? "available" : "idle",
      checkedAt: Date.now(),
    };
  M(Q),
    X(`update check: current=${z ?? "?"} latest=${W ?? "?"} available=${J}`);
}
function y(z) {
  try {
    V.appendFileSync(
      Zz,
      `[${new Date().toISOString()}] ${z}
`,
    );
  } catch {}
}
var O = null,
  g = !1;
function fz(z) {
  const { existsSync: W } = require("node:fs"),
    $ = require("node:path"),
    J = process.env.HOME ?? "",
    Q = [];
  for (const Z of (process.env.PATH ?? "").split(":"))
    if (Z) Q.push($.join(Z, z));
  if (
    (Q.push(`/opt/homebrew/bin/${z}`, `/usr/local/bin/${z}`, `/usr/bin/${z}`),
    J)
  ) {
    Q.push(
      $.join(J, ".volta", "bin", z),
      $.join(J, ".fnm", "aliases", "default", "bin", z),
      $.join(J, ".asdf", "shims", z),
      $.join(J, ".n", "bin", z),
      $.join(J, ".local", "bin", z),
    );
    const Z = $.join(J, ".nvm", "versions", "node");
    if (W(Z))
      try {
        const { readdirSync: Y } = require("node:fs"),
          K = Y(Z)
            .filter((B) => B.startsWith("v"))
            .sort();
        for (const B of K.reverse()) Q.push($.join(Z, B, "bin", z));
      } catch {}
  }
  for (const Z of Q) if (W(Z)) return Z;
  return null;
}
function hz() {
  const z = fz("npx");
  if (!z) {
    X("spawnUpdate: npx not found in PATH or known locations"),
      M({
        ...k(),
        status: "error",
        message:
          "npx not found. Install Node.js from nodejs.org or run `brew install node`.",
        checkedAt: Date.now(),
      });
    return;
  }
  const W = Wz.spawn(z, ["-y", "petdex@latest", "update", "--silent"], {
    detached: !0,
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env,
  });
  (O = W),
    W.on("error", ($) => {
      (O = null),
        X(`spawnUpdate: child error ${$.code ?? "?"} ${$.message}`),
        M({
          ...k(),
          status: "error",
          message:
            $.code === "ENOENT"
              ? "Could not run npx. Install Node.js or run: npx petdex@latest update from a terminal."
              : `Update spawn failed: ${$.message}`,
          checkedAt: Date.now(),
        });
    }),
    W.stdout?.on("data", ($) => {
      y($.toString("utf8").trimEnd());
    }),
    W.stderr?.on("data", ($) => {
      y(`stderr: ${$.toString("utf8").trimEnd()}`);
    }),
    W.on("exit", ($) => {
      O = null;
      const J = k();
      if ($ === 0) {
        const Q = D();
        M({
          ...J,
          current: Q,
          status: "done",
          message: "Update installed. Restart the desktop to use it.",
          checkedAt: Date.now(),
        }),
          y(`exit 0 (installed ${Q ?? "?"})`);
      } else
        M({
          ...J,
          status: "error",
          message: `petdex update exited with code ${$ ?? "null"}. See ${Zz}.`,
          checkedAt: Date.now(),
        }),
          y(`exit ${$}`);
    });
}
var N = m.default.createServer(async (z, W) => {
    try {
      const $ = new URL(z.url ?? "/", `http://127.0.0.1:${F}`);
      if (z.method === "GET" && $.pathname === "/health")
        return G(W, 200, { ok: !0, port: F });
      if (z.method === "GET" && $.pathname === "/whoami") {
        const J = Number(process.env.PETDEX_PARENT_PID);
        return G(W, 200, {
          ok: !0,
          pid: process.pid,
          parentPid: Number.isFinite(J) && J > 0 ? J : null,
        });
      }
      if (z.method === "GET" && $.pathname === "/state")
        try {
          const { readFileSync: J } = await import("node:fs"),
            Q = J($z, "utf8");
          W.writeHead(200, { "content-type": "application/json" }), W.end(Q);
          return;
        } catch {
          return G(W, 200, { state: "idle", counter: 0 });
        }
      if (z.method === "POST" && $.pathname === "/state") {
        const J = z.headers[q],
          Q = Array.isArray(J) ? J[0] : J;
        if (!Q || !I(Q, j)) return G(W, 401, { ok: !1, error: "unauthorized" });
        if (!a.consume()) return G(W, 429, { ok: !1, error: "rate_limited" });
        let Z;
        try {
          Z = await t(z);
        } catch {
          return G(W, 400, { ok: !1, error: "invalid_json" });
        }
        const Y = Z,
          K = typeof Y.state === "string" ? Y.state : null;
        if (!K || !d.has(K))
          return G(W, 400, { ok: !1, error: "invalid_state", valid: [...d] });
        const B =
            typeof Y.duration === "number" && Y.duration > 0
              ? Math.min(Y.duration, 30000)
              : void 0,
          b =
            typeof Y.agent_source === "string"
              ? Y.agent_source.slice(0, 64)
              : null,
          S = K === "running" ? E() : K,
          c = _.enqueue({ state: S, duration: B, receivedAt: Date.now() });
        return (
          X(`state=${S} duration=${B ?? "-"} ${c ? "queued" : "coalesced"}`),
          Iz(K, b),
          G(W, 200, { ok: !0, state: K, duration: B ?? null, queued: c })
        );
      }
      if (z.method === "GET" && $.pathname === "/bubble")
        try {
          const { readFileSync: J } = await import("node:fs"),
            Q = J(Jz, "utf8");
          W.writeHead(200, { "content-type": "application/json" }), W.end(Q);
          return;
        } catch {
          return G(W, 200, { text: "", counter: 0 });
        }
      if (z.method === "POST" && $.pathname === "/bubble") {
        const J = z.headers[q],
          Q = Array.isArray(J) ? J[0] : J;
        if (!Q || !I(Q, j)) return G(W, 401, { ok: !1, error: "unauthorized" });
        if (!a.consume()) return G(W, 429, { ok: !1, error: "rate_limited" });
        let Z;
        try {
          Z = await t(z);
        } catch {
          return G(W, 400, { ok: !1, error: "invalid_json" });
        }
        const Y = Z,
          K = typeof Y.text === "string" ? Y.text : null;
        if (!K) return G(W, 400, { ok: !1, error: "missing_text" });
        const B = K.slice(0, 200),
          b =
            typeof Y.agent_source === "string"
              ? Y.agent_source.slice(0, 64)
              : null;
        return (
          Qz(B, b),
          X(`bubble="${B.slice(0, 60)}" source=${b ?? "-"}`),
          G(W, 200, { ok: !0, text: B, counter: v })
        );
      }
      if (z.method === "GET" && $.pathname === "/update") return G(W, 200, k());
      if (z.method === "POST" && $.pathname === "/update/handoff") {
        const J = z.headers[q],
          Q = Array.isArray(J) ? J[0] : J;
        if (!Q || !I(Q, j)) return G(W, 401, { ok: !1, error: "unauthorized" });
        if (!g) {
          (g = !0), X("handoff requested by updater; releasing port");
          const Z = k();
          if (Z.status === "running")
            M({
              ...Z,
              status: "done",
              message: "Update installed. Restarting the desktop.",
              checkedAt: Date.now(),
            });
          W.writeHead(200, { "content-type": "application/json" }),
            W.end(JSON.stringify({ ok: !0 })),
            N.close(() => {
              X("handoff: server closed, exiting"), process.exit(0);
            }),
            setTimeout(() => process.exit(0), 1000).unref();
          return;
        }
        return G(W, 200, { ok: !0, alreadyHandedOff: !0 });
      }
      if (z.method === "POST" && $.pathname === "/update") {
        const J = z.headers[q],
          Q = Array.isArray(J) ? J[0] : J;
        if (!Q || !I(Q, j)) return G(W, 401, { ok: !1, error: "unauthorized" });
        const Z = k();
        if (Z.status === "running") return G(W, 200, Z);
        if (!Z.available && Z.status !== "error") return G(W, 200, Z);
        const Y = {
          ...Z,
          status: "running",
          message: "Downloading the latest release...",
          checkedAt: Date.now(),
        };
        return M(Y), y("triggered by webview click"), hz(), G(W, 202, Y);
      }
      G(W, 404, { ok: !1, error: "not_found" });
    } catch ($) {
      X(`server error: ${$.message}`), G(W, 500, { ok: !1, error: "internal" });
    }
  }),
  Uz = 2,
  P = 0;
function Xz() {
  (P += 1), N.listen(F, "127.0.0.1");
}
N.on("listening", () => {
  Dz(), X(`petdex sidecar listening on http://127.0.0.1:${F}`);
});
N.on("error", (z) => {
  if (z.code !== "EADDRINUSE") {
    X(`server.error: ${z.message}`), process.exit(1);
    return;
  }
  vz(z);
});
async function vz(z) {
  if (P >= Uz) {
    X(`server.error: ${z.message}; gave up after ${P} attempts`),
      process.exit(1);
    return;
  }
  let W = null;
  try {
    const Z = await fetch(`http://127.0.0.1:${F}/whoami`, {
      signal: AbortSignal.timeout(1000),
    });
    if (Z.ok) W = await Z.json();
  } catch {
    X(`server.error: ${z.message}; /whoami probe failed, yielding`),
      process.exit(1);
    return;
  }
  if (!W || typeof W.pid !== "number") {
    X(`server.error: ${z.message}; /whoami had no pid, yielding`),
      process.exit(1);
    return;
  }
  let $ = W.parentPid,
    J = !0;
  if (typeof $ === "number" && $ > 0)
    try {
      process.kill($, 0);
    } catch (Z) {
      J = Z.code !== "ESRCH";
    }
  else {
    X(
      `server.error: ${z.message}; incumbent pid=${W.pid} has no parentPid, yielding`,
    ),
      process.exit(1);
    return;
  }
  if (J) {
    X(
      `server.error: ${z.message}; incumbent pid=${W.pid} parent=${$} is alive, yielding`,
    ),
      process.exit(1);
    return;
  }
  X(
    `server.error: ${z.message}; killing orphan sidecar pid=${W.pid} (parent=${$} dead)`,
  );
  try {
    process.kill(W.pid, "SIGTERM");
  } catch (Z) {
    X(`failed to SIGTERM orphan: ${Z.message}`), process.exit(1);
    return;
  }
  if (!(await gz(F, 5000))) {
    X(`port :${F} still busy 5s after killing orphan, giving up`),
      process.exit(1);
    return;
  }
  X(`orphan evicted, retrying listen (attempt ${P + 1})`), Xz();
}
async function gz(z, W) {
  const $ = Date.now() + W;
  while (Date.now() < $) {
    if (
      await new Promise((Q) => {
        const Z = m.default
          .createServer()
          .once("error", () => Q(!1))
          .once("listening", () => Z.close(() => Q(!0)));
        Z.listen(z, "127.0.0.1");
      })
    )
      return !0;
    await new Promise((Q) => setTimeout(Q, 200));
  }
  return !1;
}
Xz();
var zz = 60000;
function R(z) {
  if (g) {
    X(`shutdown(${z}) ignored: handoff in progress`);
    return;
  }
  if (O) {
    X(`sidecar received ${z}; waiting for updater child to exit`);
    const W = Date.now(),
      $ = setTimeout(() => {
        X(`updater child still running after ${zz}ms; forcing exit`);
        const J = k();
        if (J.status === "running")
          M({
            ...J,
            status: "error",
            message:
              "Sidecar shut down before update finished. Re-launch Petdex and try again.",
            checkedAt: Date.now(),
          });
        N.close(() => process.exit(0)),
          setTimeout(() => process.exit(0), 1000).unref();
      }, zz);
    O.on("exit", () => {
      clearTimeout($),
        X(`updater child exited after ${Date.now() - W}ms; shutting down`),
        N.close(() => process.exit(0)),
        setTimeout(() => process.exit(0), 1000).unref();
    });
    return;
  }
  X(`sidecar received ${z}, shutting down`),
    N.close(() => process.exit(0)),
    setTimeout(() => process.exit(0), 1000).unref();
}
process.on("SIGTERM", () => R("SIGTERM"));
process.on("SIGINT", () => R("SIGINT"));
var mz = setTimeout(() => {
  e(), setInterval(() => void e(), jz).unref();
}, yz);
mz.unref();
var x = Number(process.env.PETDEX_PARENT_PID);
if (Number.isFinite(x) && x > 0) {
  X(`sidecar watching parent pid ${x}`);
  const z = setInterval(() => {
    try {
      process.kill(x, 0);
    } catch {
      if (O) return;
      X(`parent ${x} gone, exiting`), clearInterval(z), R("parent-gone");
    }
  }, 2000);
  z.unref();
}
