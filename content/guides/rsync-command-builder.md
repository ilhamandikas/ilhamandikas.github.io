---
title: rsync Command Builder Guide
description: Read source trailing-slash behavior, preview directory transfers, and understand destination deletion before running rsync locally or over SSH.
date: 2026-10-15
tags:
- linux
- storage
- devops
tool_guide_slug: rsync-command-builder
about: Generate local, SSH upload, and SSH download commands for directory transfers. Dry-run is enabled initially. The builder explains source trailing slashes, exclude patterns, archive mode, compression, checksums, bandwidth limits, and destination deletion. Real --delete commands require an acknowledgement that is reset whenever settings change.
faq:
- q: What does the trailing slash on the source change?
  a: For directory sources, a trailing slash copies the contents into the destination. Without it, the named source directory is copied under the destination. This builder controls that slash explicitly and always gives the destination a trailing slash so it is treated as a directory.
- q: Does dry-run avoid connecting to the remote server?
  a: No. When you run it, a dry-run can connect and authenticate over SSH and read file metadata to calculate changes. It does not perform the normal file transfer or destination deletions. The website itself does not connect or run anything.
- q: What does --delete remove?
  a: It removes destination-only entries in directories being synchronized. Excluded entries are normally protected because this builder does not generate --delete-excluded. A wrong source, destination, or missing mount can still cause unintended deletion. Review itemized dry-run output first.
- q: What are the SSH-mode requirements?
  a: rsync 3.0 or later must be available on both sides, along with working SSH access. The generated -s option protects remote arguments from shell reinterpretation. This builder accepts hostnames or IPv4, absolute remote paths, and a restricted local identity-file path; not IPv6 hosts, daemon mode, or remote-to-remote transfers.
- q: Are the directory paths or SSH details stored?
  a: The tool generates commands locally without saving or uploading its inputs. It does not inspect the filesystem, validate credentials, or read an SSH key file. Enter only the identity file path, never its private-key contents.
---

The most consequential part of an rsync command is often the source path, not the flags. The [rsync Command Builder](/tools/rsync-command-builder/) makes directory-versus-contents behavior explicit and keeps a separate dry-run available before a real transfer.

## Copy the contents, not an extra directory level

For a local copy from `/opt/example-app` to `/srv/backups/example-app`, keep **Copy directory contents** and **Dry-run** enabled:

```sh
rsync --archive --itemize-changes --human-readable --dry-run -- /opt/example-app/ /srv/backups/example-app/
```

A source file `/opt/example-app/config/app.yaml` maps to `/srv/backups/example-app/config/app.yaml`.

Turn contents mode off, and the source becomes `/opt/example-app` without the trailing slash. The same file then maps to `/srv/backups/example-app/example-app/config/app.yaml`. The repeated directory name is intentional: the named source directory is copied under the destination.

The builder normalizes redundant slashes and `.` path segments before controlling the source suffix. It always appends a slash to the destination to avoid single-file rename semantics. Inputs describe directories, not individual files or wildcard-selected file lists.

Archive mode (`--archive`, or `-a`) includes recursive copying and attempts to preserve symlinks, permissions, times, owners, groups, and device/special files where permitted. It does not include ACLs, extended attributes, or hard-link preservation. It is not a complete backup policy or an application-consistent database snapshot.

## Upload or download over SSH

Select upload for a local source and a remote destination. For example, with host `backup.example.com`, user `deploy`, and port `22`:

```sh
rsync --archive --itemize-changes --human-readable -s --rsh 'ssh -p 22' --dry-run -- /opt/example-app/ deploy@backup.example.com:/srv/backups/example-app/
```

Download reverses which endpoint is remote; source always means **where the data comes from**, and destination means **where changes are made**. The separate host and user fields avoid ambiguous pasted `user@host:path` inputs.

`-s` sends path arguments through the rsync protocol instead of allowing the remote shell to reinterpret them. It requires rsync 3.0+ on both machines. The local shell still needs correct quoting; the builder supplies it. Remote paths must be absolute, and wildcard paths are deliberately rejected rather than expanded.

An optional identity path refers to a key on the machine where you run the command. Do not paste a key or password into the builder. The identity-path field uses a restricted character set because it is embedded in rsync's SSH command string.

## Review a dry-run before writing

The itemized output shows planned changes. With deletion enabled, look specifically for `*deleting` entries. Dry-run still performs filesystem checks and can authenticate to the SSH server; the web page does neither.

After reviewing the plan, turn dry-run off. If **Delete destination-only entries** is on, acknowledge the deletion warning before the real command becomes available. Changing any other setting clears that acknowledgement. The separate preview remains a dry-run even when the main command is real.

`--delete` applies to destination-only entries in synchronized directories. It does not simply mean “delete the destination directory,” and excludes normally protect matching destination entries. The builder does not generate `--delete-excluded`.

Even without deletion, a real transfer can overwrite changed destination files. Before running:

- Check transfer direction and both directory paths.
- Confirm mounts are present and that an unexpectedly empty source is not a failed mount.
- Check for symlink aliases or nested source/destination trees; the builder cannot resolve them.
- Keep an appropriate backup or snapshot. A dry-run is a preview at one moment, not a guarantee about a later filesystem state.

The builder refuses filesystem-root sources, identical textual local paths, and deletion directed at `/` or the current directory. These checks catch obvious mistakes, not every dangerous path.

## Excludes and bandwidth

Enter one rsync exclude pattern per line, for example:

```text
node_modules/
*.log
```

These are rsync filter patterns, not regex. Pattern behavior depends on the transfer root; review the dry-run rather than assuming tar and rsync exclusions behave identically.

A bandwidth limit of `10240` means 10,240 KiB/s, approximately 10 MiB/s, not 10 megabits/s. Compression can help some network transfers but may waste CPU on already-compressed data. The checksum option reads file contents to decide which files need transfer; it can substantially increase disk I/O compared with the normal size-and-modification-time check.

For building an archive before transferring its containing directory, use [tar Command Builder](/tools/tar-command-builder/). To establish an SSH port forward rather than copy files, use [SSH Tunnel Builder](/tools/ssh-tunnel-builder/).

## References

- [rsync manual](https://download.samba.org/pub/rsync/rsync.1)
