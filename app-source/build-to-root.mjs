import { cp, rm } from "node:fs/promises";
import { resolve } from "node:path";

const sourceRoot = resolve(import.meta.dirname);
const repositoryRoot = resolve(sourceRoot, "..");
const outputRoot = resolve(sourceRoot, "dist");

for (const name of ["assets", "audio", "photos"]) {
  await rm(resolve(repositoryRoot, name), { recursive: true, force: true });
}

await cp(outputRoot, repositoryRoot, { recursive: true, force: true });
