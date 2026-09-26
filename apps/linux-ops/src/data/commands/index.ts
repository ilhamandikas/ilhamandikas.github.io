import type { CommandItem } from '../../types';
import { ports } from './ports';
import { nginx } from './nginx';
import { disk } from './disk';
import { ram } from './ram';
import { cpu } from './cpu';
import { io } from './io';
import { docker } from './docker';
import { git } from './git';
import { postgres } from './postgres';
import { mysql } from './mysql';
import { systemd } from './systemd';
import { network } from './network';
import { dns } from './dns';
import { search } from './search';
import { permissions } from './permissions';
import { logs } from './logs';
import { advanced } from './advanced';

// The full catalogue, grouped by the file it lives in. The order here is the
// order commands appear inside a category.
export const COMMANDS: CommandItem[] = [
  ...ports,
  ...nginx,
  ...disk,
  ...ram,
  ...cpu,
  ...io,
  ...docker,
  ...git,
  ...postgres,
  ...mysql,
  ...systemd,
  ...network,
  ...dns,
  ...search,
  ...permissions,
  ...logs,
  ...advanced,
];

export const COMMAND_BY_ID = new Map(COMMANDS.map((command) => [command.id, command]));

export const COUNTS_BY_CATEGORY = COMMANDS.reduce<Record<string, number>>((counts, command) => {
  counts[command.category] = (counts[command.category] ?? 0) + 1;
  return counts;
}, {});
