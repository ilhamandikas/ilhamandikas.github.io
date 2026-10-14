---
title: tar Command Builder Guide
description: Understand the source base, archive path, compression, excludes, and extraction safeguards in a GNU tar command.
date: 2026-10-15
tags:
- linux
- storage
tool_guide_slug: tar-command-builder
about: Generate GNU tar commands for creating, listing, and extracting archive files. Creation supports gzip, bzip2, xz, zstd, and no compression, with relative source paths and exclude patterns. Extraction defaults to refusing existing files and provides a separate listing command. The browser does not process archives or run commands.
faq:
- q: Does this work with the tar installed on macOS?
  a: The output targets GNU tar. macOS commonly ships a different tar implementation; check support for every generated option or use GNU tar. The generated commands assume a POSIX shell, not PowerShell or cmd.exe.
- q: Is the archive path relative to the source base directory?
  a: No. A relative --file path is resolved from the terminal's working directory. --directory changes the base for source paths during creation or the destination during extraction.
- q: Does refusing overwrites make extracting an unknown archive safe?
  a: No. --keep-old-files refuses existing files but is not a security audit or a sandbox. Inspect the listing and extract without root privileges into an existing empty directory; other archive risks still apply.
- q: Does the tool save paths or upload files?
  a: No. It only generates command text in the browser and does not save the input. It cannot inspect local files, check available compression programs, or verify an archive.
---

A tar command has two different path contexts: where the archive file lives and where its members come from. The [tar Command Builder](/tools/tar-command-builder/) keeps those inputs separate and explains the generated options before you run anything.

## Archive a directory without embedding its absolute path

Suppose the application is under `/opt/example-app`, and you run the command from `/srv/backups`. Select create, use `backup.tar.gz` as the archive, `/opt/example-app` as the source base, and `.` as the source path. Add `./node_modules` as an exclude pattern.

With gzip and verbose output selected, the command is:

```sh
tar --create --force-local --file backup.tar.gz --verbose --gzip --directory /opt/example-app --exclude ./node_modules -- .
```

The archive is `/srv/backups/backup.tar.gz`, not a file inside `/opt/example-app`. Its member names start from `.` rather than the entire absolute path. Exclude patterns are matched by GNU tar; quoting prevents the shell from expanding them first.

`--force-local` prevents a colon in the archive filename from selecting a remote archive transport. The `--` before source paths ends option parsing, including when a filename begins with a hyphen.

Creating an archive can overwrite an existing archive file. Keep the output outside the source tree, choose a filename deliberately, and remember that tar is not an application-consistent database backup or a snapshot of changing files.

## Compression is explicit

The create-mode selector adds the corresponding compression option. It does not rename the archive for you, so keep the filename and format consistent:

| Selection | Typical suffix |
| --- | --- |
| None | `.tar` |
| gzip | `.tar.gz` |
| bzip2 | `.tar.bz2` |
| xz | `.tar.xz` |
| zstd | `.tar.zst` |

The compressor must be installed on the machine running tar. For list and extract, GNU tar detects compression while reading the archive file; the create-mode selector is not used. This builder does not generate stdin/stdout pipelines.

## List before extracting

Choose extract, set the archive path, and use a separate destination such as `./restore`. Create that directory yourself first. The builder supplies this read-only listing command:

```sh
tar --list --verbose --force-local --file backup.tar.gz
```

Inspect the names and metadata before running the extraction command. Listing is not a malware scan or proof that the archive is safe. The default extraction command is:

```sh
tar --extract --force-local --file backup.tar.gz --verbose --directory ./restore --no-same-owner --no-same-permissions --keep-old-files
```

`--keep-old-files` refuses to replace existing files and reports conflicts as errors. Turning it off permits overwrites; extraction can still create new files even when it is on. `--no-same-owner` avoids restoring archived ownership, while `--no-same-permissions` uses the normal umask instead of requesting exact archived permissions.

Extract unfamiliar archives without root privileges, into a disposable empty directory. No generated option makes arbitrary archive contents trustworthy.

## Stripping path components

For an archive member named `release/config/app.yaml`, stripping one component writes `config/app.yaml` under the extraction directory. Stripping two writes `app.yaml`. Entries with too few components are skipped. The preview listing shows original member names, not transformed output paths.

Directory inputs must start with `/` or `./`, without `..` segments or wildcards. Source member names are relative to the base. Enter literal values rather than shell quotes; the builder supplies POSIX shell quoting. Tilde and variable expansion are not performed. Separate source paths or exclude patterns with line breaks, up to 100 entries each.

After creating a reviewed archive, [rsync Command Builder](/tools/rsync-command-builder/) can help transfer it as part of a directory copy. For a browser-created ZIP instead of a terminal command, use [ZIP Builder](/tools/zip-builder/).

## References

- [GNU tar manual](https://www.gnu.org/software/tar/manual/html_node/index.html)
- [GNU tar: security](https://www.gnu.org/software/tar/manual/html_node/Security.html)
