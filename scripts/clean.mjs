import { rm } from 'node:fs/promises';
import path from 'node:path';
await rm(path.resolve(import.meta.dirname, '../_site'), { recursive: true, force: true });
