---
title: "Long-running jobs should not depend on my SSH connection"
date: 2026-10-30
description: "I got tired of long-running jobs depending on an SSH session, so I started separating terminal persistence, logging, process state, and monitoring."
tags: ["devops", "linux", "automation"]
---

One of the more annoying parts of working on servers is waiting for something that takes a long time.

A database dump. A restore. Compressing a large directory. Moving data with `rsync`.

You start the command, watch it for a while, and then your SSH connection drops.

Maybe the Wi-Fi changes. Maybe the VPN reconnects. Maybe the laptop goes to sleep.

Then you SSH back into the server and ask the same question:

**is the process still running?**

I got tired of doing that.

## The problem was not really SSH

SSH disconnecting is normal.

What bothered me was that I had made my laptop connection part of a job that might take an hour or more.

For example:

```bash
pg_dump ...
```

The command itself may be completely fine.

But if I run it directly from a normal SSH shell, I am relying on that shell staying connected for as long as the dump runs.

That is unnecessary.

For long-running commands, I would rather have the terminal live on the server.

## There are a few ways to separate the job from my SSH connection

There is more than one tool for this, and they do not all solve exactly the same problem.

The ones I keep coming back to are:

- `screen` — persistent terminal session
- `tmux` — persistent terminal session, similar in purpose to `screen`
- `nohup` — process keeps running without a terminal to reattach to
- `systemd` — the operating system manages the process lifecycle

For the problem that started all of this — a manual dump, restore, transfer, or migration that I may want to come back to — I usually want a terminal I can detach from and reattach to later.

That puts `screen` and `tmux` in the same category.

I started with `screen` because it already solves that problem with very little ceremony.

## I started with `screen`

For simple jobs, `screen` solves most of the problem.

```bash
screen -S postgres-backup
```

Then I run the command normally.

```bash
pg_dump ...
```

If I want to leave:

```text
Ctrl+A, D
```

The terminal keeps running on the server.

Later I can reconnect and attach again.

```bash
screen -r postgres-backup
```

This is usually enough when I only need one terminal and one command.

The useful part is not really `screen` itself.

It is the fact that my SSH connection is no longer responsible for keeping the terminal alive.

## `screen` can keep a log

`screen` is not limited to terminal scrollback.

Inside a screen session, I can toggle logging with:

```text
Ctrl+A, H
```

By default, this creates a file such as:

```text
screenlog.0
```

That means I can detach, reconnect later, and still have a record of what happened.

From another shell:

```bash
tail -f screenlog.0
```

Logging itself is not what separates `screen` from `nohup` or `systemd`.

All of them can give me some form of log.

The more important difference is what they manage around the process.

## `screen` is not limited to one terminal

Before comparing it with `tmux`, one thing is worth making clear: `screen` can already manage multiple windows and split the display.

Inside an existing `screen` session, I can create another window with:

```text
Ctrl+A, C
```

Then move between windows:

```text
Ctrl+A, N    next window
Ctrl+A, P    previous window
Ctrl+A, "    list windows
```

So one session can look like this:

```text
screen session: maintenance

├── window 0: pg_dump
├── window 1: htop
├── window 2: tail -f backup.log
└── window 3: df -h
```

`screen` can also split the display into regions.

Horizontal split:

```text
Ctrl+A, S
```

Vertical split:

```text
Ctrl+A, |
```

And I can move focus between regions with:

```text
Ctrl+A, Tab
```

So I can have something roughly like:

```text
┌────────────────────────────┐
│ pg_dump                    │
├──────────────┬─────────────┤
│ htop         │ tail -f log │
└──────────────┴─────────────┘
```

This matters because the difference between `screen` and `tmux` is not that one supports multiple terminals and the other does not.

Both do.

The terminology is slightly different:

```text
screen                       tmux

session                      session
window                       window
region                       pane
Ctrl+A                       Ctrl+B
```

For the kind of long-running jobs I usually do on one server, their core capabilities overlap a lot.

## `screen` and `tmux` are very similar for this problem

For the problem in this post, I do not think there is a strong winner between `screen` and `tmux`.

Both let me create a terminal session on the server, detach from it, lose my SSH connection, reconnect later, and return to the same terminal.

With `tmux`, the basic flow looks like this:

```bash
tmux new -s postgres-backup
```

Detach:

```text
Ctrl+B, D
```

Then later:

```bash
tmux attach -t postgres-backup
```

So if I am running a database dump, restore, `rsync`, compression job, or manual migration and my SSH connection disappears, either tool solves the main problem.

`screen` can have multiple windows and split regions.

`tmux` can have multiple windows and panes.

For this use case, choosing between them is mostly about which interface, key bindings, and workflow I prefer.

Both tools are lightweight. `screen` tends to have a slightly smaller footprint, but for the kind of servers I work on, the difference is small enough that I would choose based on availability and preference rather than memory usage.

`tmux` does have features that are different from `screen`. One example is synchronized panes, where the same keyboard input can be sent to several panes at once. That can be useful when several panes contain SSH sessions to different servers and I want to run the same inspection command everywhere.

That is a real difference, but it is not something I need for the problem that started this article.

If all I want is for a two-hour process to keep running when my SSH connection drops, synchronized panes do not help me.

A persistent terminal does.

So I do not choose `tmux` because `screen` is missing some basic capability here. I am happy to use either one depending on what is already installed and which interface I feel like using.

The more important limitation is shared by both tools: keeping the terminal alive does not tell me whether the process inside it is still healthy.

## But staying connected is only half of the problem

There is another failure mode.

The SSH connection survives.

The terminal survives.

But the process itself dies.

Maybe the disk becomes full.

Maybe the database connection disappears.

Maybe the process gets killed because the server runs out of memory.

Maybe the command simply exits with an error.

A `screen` or `tmux` session can still be there even though the actual job stopped twenty minutes ago.

That means:

> keeping a terminal alive is not the same as monitoring the process inside it.

This distinction matters.

## I want output I can inspect later

For longer jobs, I usually prefer having a log instead of relying entirely on terminal scrollback.

A pattern I often use is:

```bash
pg_dump ... 2>&1 | tee backup.log
```

There are a few shell concepts in that command that are worth understanding.

## What `|` does

The pipe operator:

```bash
|
```

takes the output from the command on the left and sends it to the command on the right.

So:

```bash
pg_dump ... | tee backup.log
```

looks roughly like this:

```text
pg_dump
   |
   v
  tee
   |
   +--> terminal
   |
   +--> backup.log
```

Without `tee`, I could redirect the output directly into a file:

```bash
pg_dump ... > backup.log
```

That works.

But now I am no longer seeing the same output live in the terminal.

For a long-running job I am actively watching, I usually want both.

## Why `tee`?

`tee` lets me keep the output visible while also writing it to a file.

```bash
pg_dump ... | tee backup.log
```

So I get:

```text
terminal
+
backup.log
```

If the job fails later, I do not have to depend on terminal scrollback.

I can inspect the log directly.

```bash
tail -n 100 backup.log
```

or follow it while the process is still running:

```bash
tail -f backup.log
```

## What `2>&1` means

Linux commands normally have two output streams that matter here.

```text
stdout = 1
stderr = 2
```

`stdout` is normal output.

`stderr` is usually used for errors and warnings.

When I write:

```bash
2>&1
```

I am telling the shell to send stderr to the same place as stdout.

So:

```bash
pg_dump ... 2>&1 | tee backup.log
```

means both normal output and errors go through `tee`.

```text
              stdout ----\
pg_dump                   +--> tee --> terminal
              stderr ----/          \
                                      --> backup.log
```

Without `2>&1`, some errors may still appear in the terminal but not end up inside `backup.log`.

For troubleshooting, I usually want both streams together.

## Why I also use `pipefail`

There is one subtle problem with:

```bash
pg_dump ... 2>&1 | tee backup.log
```

This is now a pipeline containing two commands:

```text
pg_dump
tee
```

By default, the shell may return the exit status of the last command in the pipeline.

That means `pg_dump` could fail while `tee` successfully writes the error into the log.

That is not the result I want.

So before running it, I use:

```bash
set -o pipefail
```

Then:

```bash
set -o pipefail
pg_dump ... 2>&1 | tee backup.log
```

After it finishes:

```bash
echo $?
```

A result of:

```text
0
```

means success.

Anything else means something in the pipeline failed and I should inspect the log.

For a manual long-running job, this gives me a useful combination:

```text
live output
persistent log
stderr in the same log
useful exit status
```

## But `screen` can log, so why use anything else?

This is the more interesting question.

Suppose I run a database dump inside `screen`.

I can have:

```text
screen session
+
screenlog.0
+
the command itself
```

If SSH disconnects, the session stays alive.

If I reconnect, I can attach again.

If logging is enabled, I can inspect what happened.

For an ad-hoc database dump, that may genuinely be all I need.

The difference appears when I ask another question:

**who knows whether the process actually succeeded?**

`screen` mostly manages the terminal session.

The log is evidence of what happened.

But the log is not the same thing as the machine managing the state of the job.

## What happens when the process suddenly stops?

Imagine the dump fails because the disk becomes full.

Inside a normal interactive `screen` session, the structure is roughly:

```text
screen
  |
  +--> shell
         |
         +--> pg_dump
```

`pg_dump` exits.

But the shell is still running.

So when I reconnect, I may simply find:

```text
pg_dump: error ...
bisku@server:~$
```

That is actually useful.

The session survived.

The error may still be visible.

And if screen logging was enabled, it may also be inside:

```text
screenlog.0
```

The same idea applies to `tmux`.

The terminal can survive even though the process inside it has already stopped.

## Sometimes I only want to know if it is still doing work

For a manual job I am actively watching, sophisticated monitoring is often unnecessary.

I can check whether the process still exists:

```bash
pgrep -af pg_dump
```

I prefer this over:

```bash
ps aux | grep pg_dump
```

for quick checks because I do not have to deal with the `grep` process appearing in the result.

If the dump writes to a file, I can also see whether it is still growing.

```bash
watch -n 2 'du -h backup.dump'
```

And I can check available disk space.

```bash
watch -n 2 'df -h'
```

Or watch the log:

```bash
tail -f backup.log
```

These are simple signals, but together they answer the question I normally care about:

**is useful work still happening?**

## Process alive does not always mean process healthy

A process appearing in:

```bash
pgrep -af pg_dump
```

only tells me that the process exists.

It could still be waiting on I/O.

It could be stuck waiting on another service.

The output file could have stopped growing.

That is why, for a manual operation, I usually look at several things instead of relying on one signal.

```text
process exists
output keeps growing
log keeps changing
disk still has space
```

That is usually enough for something I am actively watching.

## `nohup` solves a smaller problem

Sometimes I do not care about coming back to the terminal.

I only want the process to survive logout.

That is where `nohup` is useful.

```bash
nohup rsync ... > rsync.log 2>&1 &
```

There are three parts here.

`nohup` makes the process ignore the hangup signal normally associated with its terminal going away.

This:

```bash
> rsync.log 2>&1
```

stores stdout and stderr in the log.

And:

```bash
&
```

runs the process in the background.

Then I can disconnect.

Later:

```bash
tail -f rsync.log
```

The important difference is that there is no terminal session to reattach to.

With `screen` or `tmux`, I keep the terminal context.

With `nohup`, I mostly keep the process.

For manual operations where I expect to come back and inspect things, I usually prefer `screen` or `tmux`.

## Stopping the job is another thing I want to control

There is another practical difference I care about.

Sometimes the job is not failing.

I am the one who wants to stop it.

Maybe I started the wrong database dump.

Maybe the destination path is wrong.

Maybe disk usage is growing faster than expected.

In that situation, I prefer stopping the actual command cleanly instead of immediately killing the environment around it.

## Stopping something inside `screen`

If the dump is running inside `screen`, I attach first:

```bash
screen -r postgres-backup
```

Then stop the command normally:

```text
Ctrl+C
```

That sends an interrupt to the foreground process.

After the command has stopped, I can inspect the output, check the result, and then close the shell:

```bash
exit
```

If I really want to terminate the entire screen session from outside:

```bash
screen -S postgres-backup -X quit
```

But that is not usually my first choice.

I would rather stop the job intentionally, inspect what happened, and then close the session.

## Stopping something inside `tmux`

I use the same idea with `tmux`.

Attach:

```bash
tmux attach -t postgres-backup
```

Then:

```text
Ctrl+C
```

If I am done with the shell:

```bash
exit
```

If I want to remove the entire session from outside:

```bash
tmux kill-session -t postgres-backup
```

`tmux` also lets me be more granular.

I can kill one pane:

```bash
tmux kill-pane
```

or one window:

```bash
tmux kill-window
```

That is useful if the session contains several things and I do not want to destroy the whole workspace.

## Stopping a process started with `nohup`

`nohup` is different because there is no terminal session to return to.

I need to find the process.

For example:

```bash
pgrep -af pg_dump
```

Suppose I see:

```text
18432 pg_dump -Fc database_name -f backup.dump
```

Then I can ask the process to stop:

```bash
kill 18432
```

`kill` without another option sends `SIGTERM`.

That gives the process a chance to shut down normally.

Then I check again:

```bash
pgrep -af pg_dump
```

If nothing comes back, the process has stopped.

This is one reason I find `nohup` less comfortable for manual work.

Once I leave the original shell, I am managing the process by PID instead of returning to the same terminal.

## Then there is `systemd`

At some point, a job stops feeling like something I should manually babysit.

Maybe the same backup needs to run every night.

Maybe an application must always be running.

Maybe I want the server itself to remember whether a job succeeded or failed.

That is where `systemd` comes in.

`systemd` is the system and service manager used by many modern Linux distributions. As the system instance, it normally starts as PID 1 during boot and manages userspace services for the machine.

Its job is much broader than keeping a terminal open.

It can manage things such as:

- services;
- background processes;
- startup dependencies;
- timers;
- process status;
- restart policies;
- process lifecycle.

Instead of me opening a terminal and running:

```bash
/home/bisku/backup-postgres.sh
```

I can describe that job to `systemd` as a unit.

A command or service is commonly represented by a `.service` unit, for example:

```text
backup-postgres.service
```

Conceptually, that tells the server:

```text
this is the command
this is how it should run
this is what happened when it stopped
```

Now the process belongs to the server's service manager instead of one of my terminal sessions.

For scheduled work, `systemd` also has timer units.

For example:

```text
backup-postgres.timer
```

can trigger:

```text
backup-postgres.service
```

at a defined schedule.

That is why I see `systemd` as a different category from `screen`, `tmux`, or `nohup`.

`screen` gives me a persistent terminal.

`systemd` gives the process a lifecycle managed by the operating system.

## `systemd` knows how the job ended

Because `systemd` launched and tracks the unit, I can ask it for the current state:

```bash
systemctl status backup-postgres
```

If something failed, I can see an explicit failed state and inspect the exit result instead of only trying to infer success from terminal output.

I can also inspect the unit's journal:

```bash
journalctl -u backup-postgres
```

or follow it live:

```bash
journalctl -fu backup-postgres
```

Again, the advantage is not simply that `systemd` has logs.

`screen` can log too.

`nohup` can redirect output to a file too.

The useful part is that `systemd` understands the relationship between the process and its lifecycle: when it started, whether it is still running, and how it exited.

For a service that is supposed to stay running, it can also have a restart policy such as:

```ini
Restart=on-failure
```

That is process supervision.

It is something fundamentally different from keeping a shell alive in `screen`.

For a one-shot database dump, I usually would not blindly restart it. For an API, worker, or another long-running service, automatic restart may make much more sense.

## Stopping something managed by `systemd`

With `systemd`, the process has an explicit lifecycle.

So stopping it is straightforward:

```bash
sudo systemctl stop backup-postgres
```

Then:

```bash
systemctl status backup-postgres
```

The intent is clear.

I am not looking for a PID.

I am not finding the correct terminal.

I am telling the service manager that this unit should stop.

That distinction becomes increasingly useful as a job becomes more important.

## I prefer graceful stop before killing the session

For manual work, my rule is simple:

> stop the process first, then remove the environment around it.

For `screen`:

```text
attach
Ctrl+C
inspect
exit
```

For `tmux`:

```text
attach
Ctrl+C
inspect
exit
```

I only reach for:

```bash
screen -S postgres-backup -X quit
```

or:

```bash
tmux kill-session -t postgres-backup
```

when I actually want to remove the session itself.

The job and the terminal around the job are two different things.

## Logs and state are not the same thing

This is the distinction that finally made these tools easier for me to reason about.

```text
screen
    persistent terminal session
    + multiple windows and split regions
    + optional log

tmux
    persistent terminal session
    + multiple windows and panes
    + optional logging
    + additional workspace features

nohup
    detached process
    + redirected log

systemd
    managed process
    + status
    + exit result
    + journal
    + scheduling
    + restart policy
```

All of them can leave behind text describing what happened.

But logs answer:

**what did the process print?**

Process management answers:

**what happened to the process?**

Those are different questions.

## And even `systemd` is not monitoring me

Suppose `systemd` correctly records:

```text
backup-postgres.service = failed
```

That still does not mean I know about it.

The server knows.

I do not necessarily know.

So the progression becomes:

```text
Will the terminal survive?
        |
        v
screen / tmux

Will the process survive logout?
        |
        v
screen / tmux / nohup

Will the machine understand the process state?
        |
        v
systemd

Will I know when something fails?
        |
        v
monitoring / alerting
```

That is why I do not think of these tools as direct replacements for each other.

They solve different layers of the same operational problem.

## What I use now

My rule is fairly simple.

For a manual long-running job where I want to return to the same terminal, I am comfortable with either:

```text
screen / tmux
```

That covers most of the cases that originally made me look for these tools: database dumps, restores, large transfers, compression, and manual migrations.

For this problem, I do not need to treat `tmux` as an upgrade from `screen`. Both solve the part I care about: the terminal stays on the server even when my SSH connection disappears.

Which one I use can simply come down to preference, familiarity, or what is already installed.

`tmux` has extra workspace features such as synchronized panes, but those are useful for different workflows. They are not necessary just to protect a long-running command from an SSH disconnect.

For something I want to start in the background and mostly forget about:

```text
nohup
```

For something recurring or important enough that the machine needs to understand whether it succeeded:

```text
systemd
```

And if failure cannot be silent:

```text
monitoring / alerting
```

The thing I originally wanted to fix was simple.

I was tired of waiting for a long-running process and then suddenly losing my SSH connection.

That led me to `screen` and `tmux`.

Then I realized there was another problem.

A terminal can survive while the process inside it has already failed.

And then another one.

The server can know that a process failed while I still know nothing about it.

So now I separate those concerns.

My laptop should not determine whether a two-hour database dump survives.

My terminal should not be the only place where failure exists.

And when I do need to stop something, I want to stop the job deliberately, not just kill whatever terminal happens to be holding it.

## References

- [GNU Screen: windows](https://www.gnu.org/software/screen/manual/html_node/Windows.html)
- [GNU Screen: regions](https://www.gnu.org/software/screen/manual/html_node/Regions.html)
- [GNU Screen: logging](https://www.gnu.org/software/screen/manual/html_node/Log.html)
- [GNU Screen: command reference](https://www.gnu.org/software/screen/manual/screen.html)
- [tmux manual](https://man.openbsd.org/tmux)
- [systemd system and service manager](https://www.freedesktop.org/software/systemd/man/latest/systemd.html)
- [journalctl](https://www.freedesktop.org/software/systemd/man/latest/journalctl.html)