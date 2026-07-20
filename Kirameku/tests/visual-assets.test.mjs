import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

function readUint24LE(buffer, offset) {
  return buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16);
}

function readWebpDimensions(buffer) {
  assert.equal(buffer.subarray(0, 4).toString("ascii"), "RIFF");
  assert.equal(buffer.subarray(8, 12).toString("ascii"), "WEBP");

  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const chunkType = buffer.subarray(offset, offset + 4).toString("ascii");
    const chunkSize = buffer.readUInt32LE(offset + 4);
    const dataOffset = offset + 8;

    if (chunkType === "VP8X") {
      return {
        width: readUint24LE(buffer, dataOffset + 4) + 1,
        height: readUint24LE(buffer, dataOffset + 7) + 1,
      };
    }
    if (chunkType === "VP8L") {
      assert.equal(buffer[dataOffset], 0x2f);
      const bits = buffer.readUInt32LE(dataOffset + 1);
      return {
        width: (bits & 0x3fff) + 1,
        height: ((bits >>> 14) & 0x3fff) + 1,
      };
    }
    if (chunkType === "VP8 ") {
      assert.equal(buffer.subarray(dataOffset + 3, dataOffset + 6).toString("hex"), "9d012a");
      return {
        width: buffer.readUInt16LE(dataOffset + 6) & 0x3fff,
        height: buffer.readUInt16LE(dataOffset + 8) & 0x3fff,
      };
    }

    offset = dataOffset + chunkSize + (chunkSize % 2);
  }

  throw new Error("WebP dimensions not found");
}

async function readAsset(relativePath) {
  const buffer = await readFile(new URL(relativePath, root));
  assert.ok(buffer.byteLength > 10_000, `${relativePath} is unexpectedly small`);
  return { buffer, ...readWebpDimensions(buffer) };
}

async function collectTextFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if ([".git", ".next", "dist", "node_modules", "venv"].includes(entry.name)) continue;
    const child = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, directory);
    if (entry.isDirectory()) {
      files.push(...await collectTextFiles(child));
    } else if (/\.(?:css|html|js|json|md|mjs|py|ts|tsx|vue)$/i.test(entry.name)) {
      files.push(child);
    }
  }
  return files;
}

test("phase three raster assets exist as WebP at their locked aspect ratios", async () => {
  const spirit = await readAsset("public/brand/illustrations/resonance-spirit.webp");
  const cover = await readAsset("public/brand/projects/second-brain-cover.webp");
  const share = await readAsset("public/brand/projects/second-brain-share.webp");

  assert.ok(spirit.width > 0 && spirit.height > 0);
  assert.equal(cover.width * 9, cover.height * 16, "SecondBrain cover must be 16:9");
  assert.equal(share.width, share.height, "SecondBrain share image must be 1:1");
});

test("frontend source and tests contain no legacy resonance asset filename", async () => {
  const legacyName = ["resonance", "sprite.webp"].join("-");
  const files = await collectTextFiles(root);

  for (const file of files) {
    const source = await readFile(file, "utf8");
    assert.doesNotMatch(source, new RegExp(legacyName), file.pathname);
  }
});
