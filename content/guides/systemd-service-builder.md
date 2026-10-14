---
title: systemd Service Builder Guide
description: Turn a foreground application into a reviewable Linux service, then check its unit, startup behavior, and logs.
date: 2026-10-14
tags:
- linux
- devops
tool_guide_slug: systemd-service-builder
about: Generate a system-level Type=simple service for a foreground application running under an existing non-root user. Configure its working directory, literal arguments, optional environment file, restart policy, network ordering, and optional NoNewPrivileges and PrivateTmp settings.
faq:
- q: Does this install or start a service on my server?
  a: No. It generates a unit file and commands locally in the browser. Inputs are not uploaded or saved. You must review the output and run any installation commands yourself.
- q: Can I paste a shell command into the arguments field?
  a: No. Enter an absolute executable path separately and one literal argument per line. The builder escapes dollar signs and percent signs rather than expanding variables, and does not run pipes or redirects. Blank lines are ignored; empty arguments and standalone semicolons are not supported.
- q: Which service types are supported?
  a: Only system-level Type=simple units for foreground processes under an existing non-root account. Forking daemons, notify services, oneshot jobs, timers, template units, and user services need different configuration.
- q: Is an EnvironmentFile the same as sourcing a .env file?
  a: No. systemd parses the file using its own assignment and quoting rules. It does not execute a shell or expand shell expressions. Use plain KEY=value assignments and check systemd.exec for details; do not assume an application's dotenv file is compatible.
---

An application launched from a terminal stops being manageable once it needs boot-time startup, crash recovery, and consistent logs. The [systemd Service Builder](/tools/systemd-service-builder/) puts those settings into a unit you can inspect before installing it.

## A Node application under /opt

The example settings describe:

```text
Service: example-app
Executable: /usr/bin/node
Working directory: /opt/example-app
User: app
Argument: /opt/example-app/server.js
Restart: on-failure
Restart delay: 5 seconds
```

The `app` account, executable, directory, and script must exist on your server. This example does not create them. Check the actual Node path with `command -v node`; a binary supplied by a per-user version manager may not be in `/usr/bin` or available to the service account.

The generated core settings are:

```ini
[Service]
Type=simple
User=app
WorkingDirectory=/opt/example-app
ExecStart="/usr/bin/node" "/opt/example-app/server.js"
Restart=on-failure
RestartSec=5s
TimeoutStopSec=30s
StandardOutput=journal
StandardError=journal
```

`Type=simple` expects the main process to stay in the foreground. Do not add a background `&` or use an application option that forks into a daemon. This type does not wait for application readiness before considering startup dispatched.

`Restart=on-failure` requests another start after a failure, not after a normal successful exit. Restart attempts remain subject to systemd's start-rate limits. A service that fails quickly can still end up stopped; inspect the logs rather than assuming it will restart forever.

On shutdown, the application should handle termination and exit. The 30-second stop timeout is a limit, not a delay that every shutdown must take; remaining processes can be forcibly terminated when the timeout expires.

## Literal arguments, not shell syntax

For a command equivalent to:

```sh
/usr/bin/node /opt/example-app/server.js --label 'example app'
```

Enter `/usr/bin/node` as the executable and these three argument lines:

```text
/opt/example-app/server.js
--label
example app
```

Do not include shell quotes around `example app`; the entire line is one argument already. The builder quotes it for systemd. `$HOME` remains the literal text `$HOME`, not a substituted path. Put credentials in neither arguments nor the unit file; arguments may be visible in process listings.

An optional environment file is a **path**, not pasted secrets. Missing files normally fail service startup; enable the missing-file option only if that absence is intentional. Environment variables are not a general-purpose secret transport—use the platform's credential facilities when appropriate.

## Review before enabling

Download `example-app.service`, then verify it on the target machine:

```sh
systemd-analyze verify ./example-app.service
```

That catches unit syntax and some local reference problems, not application correctness or readiness. Confirm the service account can read the code, traverse its directories, and write only where required.

Install the reviewed unit and reload systemd's configuration:

```sh
sudo install -m 0644 ./example-app.service /etc/systemd/system/example-app.service
sudo systemctl daemon-reload
sudo systemctl enable --now example-app.service
```

The last command **starts the application now** and enables it for future boots. It does not create a user, deploy code, or open a firewall port.

Inspect startup and recent logs:

```sh
systemctl status example-app.service --no-pager
journalctl -u example-app.service -n 100 --no-pager
```

After changing the unit, run `daemon-reload` and restart the service. After changing only application code, a restart may suffice, depending on the application's deployment model.

## Optional settings have trade-offs

- **network-online.target** adds both a dependency and startup ordering. Its meaning depends on the host's network manager and wait-online configuration; it does not guarantee that a database or external API is reachable. Applications should handle connection failures.
- **NoNewPrivileges** prevents the process and its descendants from gaining privileges through subsequent execution. It can break programs that depend on setuid or similar mechanisms.
- **PrivateTmp** isolates `/tmp` and `/var/tmp` from other services. Do not enable it if the application depends on exchanging files there with another process.

The builder intentionally does not configure every sandbox or resource limit. Adjust the unit to the workload and installed systemd version. For troubleshooting beyond the unit itself, [Dev Ops](/tools/linux-ops/) provides command-oriented checks; an [nginx reverse proxy](/tools/nginx-reverse-proxy-wizard/) is a separate layer in front of an HTTP application.

## References

- [systemd.service: service types, commands, and restart behavior](https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html)
- [systemd.exec: users, environment files, and sandboxing](https://www.freedesktop.org/software/systemd/man/latest/systemd.exec.html)
- [systemd.special: network targets](https://www.freedesktop.org/software/systemd/man/latest/systemd.special.html)
