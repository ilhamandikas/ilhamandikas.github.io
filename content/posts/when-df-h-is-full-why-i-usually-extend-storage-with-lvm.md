---
title: "When /home Is Full: Why LVM Makes Storage Expansion Easier"
date: 2026-10-28
description: "A practical explanation of how Linux storage expansion works with and without LVM, why partition layout matters, what happens when another partition blocks /home, and why LVM exists."
tags: ["linux", "storage", "lvm", "proxmox", "iscsi", "devops"]
---

Most storage expansion problems I run into start with something simple:

```bash
df -h
```

Imagine I see this:

```text
Filesystem                         Size  Used Avail Use% Mounted on
/dev/mapper/ubuntu--vg-root--lv      50G   20G   30G  40% /
/dev/sda2                             2G  250M  1.7G  13% /boot
/dev/mapper/ubuntu--vg-home--lv     100G   95G    5G  95% /home
```

`/home` is almost full.

Maybe it contains application files, deployment directories, uploads, source code, user files, or other data that has grown over time.

The path is already in use. Everything is working. I just need more space.

What I want is simple:

```text
/home
100 GB
```

becomes:

```text
/home
300 GB
```

without changing `/home` into another path.

That is the problem this article is about.

Sometimes this is easy without LVM.

Sometimes the partition layout gets in the way.

And sometimes the easiest solution is to attach another disk or iSCSI LUN and let LVM add that capacity underneath the same `/home` filesystem.

# First: what does `df -h` actually show?

`df` means **disk free**.

The `-h` option means **human-readable**.

So:

```bash
df -h
```

shows filesystem capacity in values such as:

```text
100G
95G
5G
```

The important part is this:

```text
/home
```

is only the **mount point**.

It is not necessarily the physical disk.

There may be several storage layers underneath it.

For example, this:

```text
/dev/mapper/ubuntu--vg-home--lv → /home
```

already tells me `/home` is backed by an LVM Logical Volume.

# Disk, partition, filesystem, and mount point are different

A simple non-LVM storage stack might look like:

```text
Disk
 ↓
Partition
 ↓
Filesystem
 ↓
Mount point
```

For example:

```text
/dev/sda
   ↓
/dev/sda3
   ↓
ext4
   ↓
/home
```

These are different things:

```text
/dev/sda
→ whole disk

/dev/sda3
→ one partition on that disk

ext4
→ filesystem

/home
→ directory where the filesystem is mounted
```

The user or application normally only cares about:

```text
/home
```

# What is `/dev`?

Linux exposes devices through special device nodes under:

```text
/dev
```

For example:

```text
/dev/sda
/dev/sdb
/dev/sdc
```

are block-device names.

`/dev/sda` usually represents a whole disk-like device.

A number after it normally means a partition:

```text
/dev/sda
├── /dev/sda1
├── /dev/sda2
├── /dev/sda3
└── /dev/sda4
```

NVMe devices look different:

```text
/dev/nvme0n1
/dev/nvme0n1p1
```

Virtio disks may appear as:

```text
/dev/vda
/dev/vdb
```

So I never assume the new disk will definitely be `/dev/sdb`.

I check:

```bash
lsblk
```

# The real problem: `/home` is full

Suppose I do **not** use LVM.

My server might look like this:

```text
/dev/sda
├── /dev/sda1   → EFI
├── /dev/sda2   → /boot
├── /dev/sda3   → /
└── /dev/sda4   → /home
```

And:

```bash
df -h /home
```

shows:

```text
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda4        100G   95G    5G  95% /home
```

The requirement is not:

> Give me another directory.

It is:

> Make the existing `/home` larger.

# Non-LVM: when growing `/home` is easy

Suppose `/home` is the final partition on the disk:

```text
/dev/sda
├── sda1 → EFI
├── sda2 → /boot
├── sda3 → /
└── sda4 → /home 100 GB
```

The virtual disk is 200 GB.

I increase it in Proxmox to 400 GB.

Linux may now see:

```text
/dev/sda = 400 GB
```

while `/dev/sda4` is still only 100 GB.

The layout is now conceptually:

```text
[/ EFI ][ /boot ][ / ][ /home 100G ][ free 200G ]
```

This is the easy case.

The free space is directly after `/home`.

So `/home` can expand into it.

For an ext4 filesystem, a common flow is conceptually:

```bash
lsblk
growpart /dev/sda 4
resize2fs /dev/sda4
df -h /home
```

For XFS, after the partition is enlarged, the filesystem is normally grown from the mount point:

```bash
xfs_growfs /home
```

In this situation, non-LVM is perfectly fine.

LVM is not required just for the sake of using LVM.

# Why a normal partition needs free space next to it

A normal partition represents one continuous range of sectors on one disk.

Think of the disk as a row of rooms:

```text
[ room 1 ][ room 2 ][ room 3 ][ empty ]
```

If `/home` is the last room before the empty space:

```text
[/home][free]
```

it can simply grow to the right:

```text
[/home................]
```

But this is different:

```text
[/home][another partition][free]
```

`/home` cannot jump over that other partition.

The free capacity exists, but it is in the wrong place.

# A real non-LVM case where adding disk capacity does not immediately help `/home`

Suppose the original disk is:

```text
/dev/sda 200 GB
├── sda1   1 GB   → EFI
├── sda2   2 GB   → /boot
├── sda3  80 GB   → /
├── sda4 100 GB   → /home
└── sda5  10 GB   → swap
```

Ignore the exact totals here; the important part is the order:

```text
[ EFI ][ /boot ][ / ][ /home ][ swap ]
```

Now `/home` is almost full.

I enlarge the virtual disk by 200 GB.

The disk becomes larger, but the layout becomes:

```text
[ EFI ][ /boot ][ / ][ /home ][ swap ][ free 200G ]
```

The new space exists.

But `/home` cannot directly use it.

Why?

Because swap is sitting between `/home` and the free space.

The partition that can naturally grow into the new free space is actually the **last partition**, which in this example is swap:

```text
[ /home ][ swap ][ free ]
```

could become:

```text
[ /home ][ swap............. ]
```

But that does not solve the problem because the thing that is full is `/home`, not swap.

# Can I just make swap smaller and give that space to `/home`?

Not quite.

Suppose I start with:

```text
[/home 100G][swap 10G][free 200G]
```

If I only shrink swap from its right side:

```text
[/home 100G][swap 5G][free 205G]
```

swap is still in the middle.

`/home` still cannot reach the free space.

What I really need is to move swap out of the way.

Because swap does not contain permanent files, this particular case is relatively manageable.

Conceptually:

```text
Before:
[/home 100G][swap 10G][free 200G]

Temporarily remove/recreate swap:
[/home 100G][free 210G]

Grow /home:
[/home 300G][free 10G]

Create swap again at the end:
[/home 300G][swap 10G]
```

So non-LVM is **not impossible** here.

It simply requires changing the partition layout.

# If this is urgent, what do I do?

Before touching partitions, I first identify exactly what is mounted where:

```bash
lsblk -f
findmnt /home
swapon --show
free -h
```

That matters because deleting the wrong partition is obviously much worse than running out of disk space.

If the only thing blocking `/home` is swap, the high-level emergency procedure is:

```text
verify the layout
      ↓
make sure RAM can survive without the current swap
      ↓
disable the old swap
      ↓
remove/recreate the swap partition layout
      ↓
grow the /home partition
      ↓
grow the filesystem
      ↓
create swap again at the end
      ↓
enable swap again
```

If swap is heavily used and RAM is tight, I would not blindly run `swapoff`.

A temporary swap file can be useful before changing the old swap partition.

The important lesson is that an urgent non-LVM fix may be possible, but it can involve more moving parts than simply adding capacity.

# What if the blocking partition is `/home`, ordinary data, or system data?

The answer depends on what that partition contains.

## If the blocking partition is swap

This is usually the easiest case because swap can be recreated.

```text
[target][swap][free]
```

can often be rearranged into:

```text
[target........][swap]
```

## If the blocking partition contains movable data

Suppose the layout is:

```text
[/home][/archive][free]
```

or:

```text
[/home][/srv][free]
```

If the blocking filesystem contains ordinary data, I can move that data somewhere else first.

Conceptually:

```text
1. copy the blocking filesystem to another disk
2. verify the copy
3. unmount the old filesystem
4. remove or recreate its old partition
5. grow /home
6. recreate the other filesystem if needed
7. restore the data
```

When moving Linux files, I care about more than file contents.

I also want to preserve ownership, permissions, timestamps, symlinks, ACLs, and extended attributes.

A command such as:

```bash
rsync -aHAX /source/ /mnt/temporary-disk/
```

is often more appropriate than a simple file copy.

I still verify the result before removing the original filesystem.

Sometimes the cleaner design is to leave that data permanently on the new disk instead of putting it back.

## If the blocking partition contains system data

Now the risk is much higher.

For example:

```text
[/home][/var][free]
```

or:

```text
[/home][/usr][free]
```

or a layout involving the root filesystem:

```text
[/home][/][free]
```

`/var`, `/usr`, and `/` are not just ordinary folders that I casually move while Linux is running.

They may contain or be actively used by:

```text
system services
logs
package-manager data
Docker
libraries
databases
application state
boot-time files
```

For a case like that, I usually prefer one of these approaches:

```text
attach another disk and migrate /home there
```

or, if the partition table really must be rearranged:

```text
use a maintenance or rescue environment
```

The more important the blocking filesystem is to the running OS, the less attractive live partition surgery becomes.

A simple way to think about it is:

| Blocking partition | Relative difficulty |
| --- | --- |
| swap | easiest to recreate |
| archive / backup data | usually easy to move |
| `/home` or another user-data filesystem | usually movable with planning |
| application data | movable, but may require downtime |
| `/var` | sensitive |
| `/usr` | very sensitive |
| `/` | very sensitive |
| boot / EFI | avoid touching unless necessary |

# Another non-LVM problem: the new capacity arrives as another disk

There is another common situation.

Instead of enlarging the existing disk, Proxmox or the storage platform gives me another disk:

```text
/dev/sda = existing disk
/dev/sdb = new 200 GB disk
```

My `/home` filesystem may still live on:

```text
/dev/sda4
   ↓
ext4
   ↓
/home
```

A normal ext4 or XFS filesystem on `/dev/sda4` cannot simply say:

```text
use the old blocks from /dev/sda4
plus 200 GB from /dev/sdb
```

They are separate block devices.

Without another storage layer, I normally need to migrate `/home` to the new disk, create another mount layout, or otherwise redesign the storage.

This is one of the reasons LVM exists.

# Why LVM exists

Traditional partitions are closely tied to **where storage physically sits**.

LVM adds an abstraction layer so I can manage storage based more on **how much capacity I need** than on exactly where that capacity happens to be located.

The simplest summary is:

> **Partitions manage pieces of disks. LVM manages pools of storage.**

Without LVM, I think about things such as:

```text
Which partition is last?
Where is the free space?
What partition is in the way?
Can I enlarge this exact disk?
Do I need to move another filesystem first?
```

With LVM, I can create a storage pool and allocate logical volumes from it.

The main terms are:

```text
PV
Physical Volume

VG
Volume Group

LV
Logical Volume
```

I think of them like this:

```text
PV
→ storage given to LVM

VG
→ a pool containing that storage

LV
→ a logical block device allocated from the pool
```

The stack becomes:

```text
Disk or LUN
    ↓
   PV
    ↓
   VG
    ↓
   LV
    ↓
Filesystem
    ↓
 /home
```

# A simple `/home` example with LVM

Suppose `/home` starts with 100 GB:

```text
/dev/sda → PV
            ↓
        ubuntu-vg
            ↓
        home-lv 100 GB
            ↓
           ext4
            ↓
          /home
```

Now `/home` reaches 95 GB used.

I need another 200 GB.

Instead of rearranging old partitions, I attach another 200 GB disk:

```text
/dev/sdb = 200 GB
```

I can give that disk to LVM:

```text
old PV 100 GB ─┐
               ├── ubuntu-vg = 300 GB total capacity
new PV 200 GB ─┘
```

Then the Logical Volume backing `/home` can grow:

```text
home-lv
100 GB → 300 GB
```

The filesystem grows too:

```text
filesystem
100 GB → 300 GB
```

And the user still sees:

```text
/home
```

Nothing about the application path needs to change.

# How can two different disks look like one storage device?

This is the part that can feel strange at first.

Suppose I have:

```text
/dev/sda = 100 GB
/dev/sdb = 200 GB
```

They are still physically two separate block devices.

LVM does not magically weld them into one physical disk.

Instead, LVM creates a **mapping layer**.

LVM divides Physical Volumes into chunks called **Physical Extents (PEs)**.

Logical Volumes are built from corresponding **Logical Extents (LEs)**.

Conceptually:

```text
Physical storage:

Disk A
[ PE1 ][ PE2 ][ PE3 ]

Disk B
[ PE4 ][ PE5 ][ PE6 ]
```

LVM can map them into one logical sequence:

```text
Logical Volume:
[ LE1 ][ LE2 ][ LE3 ][ LE4 ][ LE5 ][ LE6 ]
```

For example:

```text
LE1 → PE on Disk A
LE2 → PE on Disk A
LE3 → PE on Disk A
LE4 → PE on Disk B
LE5 → PE on Disk B
LE6 → PE on Disk B
```

The filesystem above LVM sees one logical block device:

```text
/dev/ubuntu-vg/home-lv
```

It does not need to care that some blocks ultimately live on one PV and some on another.

That is the trick.

# LVM does not physically insert one disk into another

LVM is **not** doing this:

```text
Disk A
[ old data ][ Disk B somehow inserted here ][ more data ]
```

The physical devices remain separate.

LVM simply maintains a logical map above them:

```text
Disk A ─┐
        ├── VG → LV → filesystem → /home
Disk B ─┘
```

This is why the physical space does not need to be adjacent in the same way a normal partition does.

# LVM does not magically fix a blocked partition

There is an important limitation.

Suppose the PV itself is a partition:

```text
/dev/sda
├── /dev/sda3 → PV
└── /dev/sda4 → another filesystem
```

and free space exists after `/dev/sda4`.

LVM cannot make `/dev/sda3` jump over `/dev/sda4`.

The normal partition rule still applies.

The advantage is that I may not need to grow `/dev/sda3` at all.

I can attach another disk:

```text
/dev/sdb → new PV
```

and add it to the existing VG:

```text
/dev/sda3 → old PV ─┐
                    ├── VG → LV → /home
/dev/sdb  → new PV ─┘
```

So LVM does not remove the physical partition limitation.

It gives me another way around it.

# A real LVM expansion flow

Suppose:

```bash
df -h /home
```

shows:

```text
Filesystem                         Size  Used Avail Use% Mounted on
/dev/mapper/ubuntu--vg-home--lv     100G   95G    5G  95% /home
```

I inspect the storage layers:

```bash
lsblk -f
pvs
vgs
lvs
```

Suppose the VG has no free capacity and I attach a new empty 200 GB disk that Linux identifies as `/dev/sdb`.

After carefully verifying that `/dev/sdb` is the intended empty disk, the LVM part is conceptually:

```bash
pvcreate /dev/sdb
vgextend ubuntu-vg /dev/sdb
lvextend -l +100%FREE /dev/ubuntu-vg/home-lv
```

Then I grow the filesystem.

For ext4:

```bash
resize2fs /dev/ubuntu-vg/home-lv
```

For XFS:

```bash
xfs_growfs /home
```

Afterward:

```bash
df -h /home
```

may show something like:

```text
Filesystem                         Size  Used Avail Use% Mounted on
/dev/mapper/ubuntu--vg-home--lv     300G   95G  205G  32% /home
```

The mount point is still exactly the same:

```text
/home
```

Only the storage layers underneath it changed.

# What if I enlarge the existing LVM disk instead?

LVM also works when I enlarge an existing virtual disk.

If the whole device is already a PV:

```text
/dev/sdb
   ↓
  PV
```

and Proxmox changes it from:

```text
100 GB
```

to:

```text
300 GB
```

then, after Linux sees the larger device, LVM can discover the new capacity with:

```bash
pvresize /dev/sdb
```

Then the flow is:

```text
larger PV
   ↓
VG gains free capacity
   ↓
LV grows
   ↓
filesystem grows
   ↓
/home grows
```

If the PV is inside a partition such as `/dev/sdb1`, that partition may still need to grow first.

Again, LVM does not make partition geometry disappear.

# Why `df -h` can stay unchanged after I add storage

Adding capacity at one layer does not automatically resize every layer above it.

For example:

```text
Proxmox disk
300 GB
```

can still have:

```text
partition
100 GB
```

or:

```text
PV
100 GB
```

or:

```text
LV
100 GB
```

or:

```text
filesystem
100 GB
```

`df -h` reports the filesystem's usable capacity.

So I think from bottom to top:

```text
Proxmox / iSCSI
       ↓
block device
       ↓
partition, if used
       ↓
PV, if LVM is used
       ↓
VG
       ↓
LV
       ↓
filesystem
       ↓
/home
```

Then I ask:

> Which layer has not grown yet?

# My usual troubleshooting flow

I start with:

```bash
df -h
```

Then:

```bash
lsblk -f
```

For `/home` specifically:

```bash
findmnt /home
df -T /home
```

If LVM is involved:

```bash
pvs
vgs
lvs
```

Those commands answer different questions:

```text
df -h
→ which filesystem is running out of space?

lsblk -f
→ what disks, partitions, filesystems, and mounts exist?

findmnt /home
→ what device actually backs /home?

pvs
→ which devices are LVM Physical Volumes?

vgs
→ how much total and free capacity exists in the Volume Group?

lvs
→ how large is the Logical Volume?
```

# Non-LVM versus LVM

| | Non-LVM | LVM |
| --- | --- | --- |
| Keep `/home` as the same path | Yes | Yes |
| Grow an existing disk | Easy when the layout permits | Easy when the layout permits |
| Partition needs adjacent free space | Yes | Yes, if growing that same PV partition |
| Add another disk to the same logical storage | Not directly | Yes |
| Combine capacity from multiple disks/LUNs | Not directly | Yes, through PVs and a VG |
| Avoid moving an unrelated blocking partition | Often requires migration or rearrangement | Often possible by adding another PV |
| Number of storage layers | Fewer | More |
| Troubleshooting | Simpler | Requires PV/VG/LV knowledge |
| Simple fixed-purpose server | Excellent | Sometimes unnecessary |
| Long-lived server that keeps growing | Can become layout-dependent | Usually more flexible |

# When I am happy with non-LVM

Non-LVM is perfectly reasonable when the layout is simple.

For example:

```text
/dev/sda4
   ↓
ext4
   ↓
/home
```

If `/dev/sda4` is the final partition and the virtual disk can be enlarged, growing `/home` can be very straightforward.

That is a good design.

# When I prefer LVM

I prefer LVM when I expect storage requirements to change over the lifetime of the server.

A server may start with:

```text
/home = 100 GB
```

then need:

```text
/home = 300 GB
```

and later:

```text
/home = 500 GB
```

The next capacity increase may come from:

```text
a larger Proxmox virtual disk
another Proxmox virtual disk
an iSCSI LUN
another iSCSI LUN
```

LVM gives me a layer where those physical storage changes do not have to map directly to changes in the path the application or user sees.

# LVM is not RAID

Combining capacity through LVM does not automatically make the data redundant.

If I have:

```text
/dev/sda ─┐
          ├── VG
/dev/sdb ─┘
```

that does not mean every block exists on both devices.

It only means both devices can contribute storage capacity.

In simple terms:

```text
LVM
→ flexible storage management

RAID
→ disk layout and possible redundancy

Backup
→ recovery from data loss
```

They solve different problems.

# The point

The problem I care about is not simply:

> How do I attach another disk?

It is:

> `/home` is almost full. How do I make the same `/home` larger with the least disruptive change?

Without LVM, that may be very easy when `/home` is the last partition and the free space is directly after it.

But if the layout is:

```text
[/home][swap][free]
```

or:

```text
[/home][another filesystem][free]
```

then the partition in the middle has to be dealt with first.

If it is swap, it can usually be recreated.

If it contains movable data, I can migrate that data first.

If it contains important system data, I may prefer migration, maintenance mode, or a different disk instead of live partition surgery.

LVM exists to reduce how much storage management depends on that physical partition layout.

It lets me think in terms of a pool:

```text
Disk / LUN 1 → PV ─┐
                   ├── VG → LV → filesystem → /home
Disk / LUN 2 → PV ─┘
```

The underlying devices can change while `/home` remains `/home`.

That is the practical reason I usually prefer LVM for Linux servers that I expect to keep growing.
