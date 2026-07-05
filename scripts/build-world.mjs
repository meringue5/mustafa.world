import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";

const root = process.cwd();
const roomsDir = path.join(root, "world-vault", "rooms");
const outputPath = path.join(root, "src", "generated", "world.json");

const files = await listMarkdownFiles(roomsDir);
const rooms = {};
const errors = [];

for (const filePath of files) {
  const source = await readFile(filePath, "utf8");
  const { frontmatter, body } = parseDocument(source, filePath);
  const slug = path.basename(filePath, ".md");

  if (!frontmatter.id) errors.push(`${relative(filePath)}: missing id`);
  if (!frontmatter.name) errors.push(`${relative(filePath)}: missing name`);
  if (frontmatter.type !== "room") errors.push(`${relative(filePath)}: type must be room`);

  const id = frontmatter.id;
  if (!id) continue;
  if (rooms[id]) errors.push(`${relative(filePath)}: duplicate id ${id}`);

  const links = normalizeLinks(frontmatter.links ?? [], filePath);
  const description = section(body, "설명");
  const sensation = section(body, "감각");

  rooms[id] = {
    id,
    slug,
    type: "room",
    name: frontmatter.name,
    area: frontmatter.area ?? null,
    tags: frontmatter.tags ?? [],
    objects: normalizeObjects(frontmatter.objects ?? [], filePath),
    actors: normalizeActors(frontmatter.actors ?? [], filePath),
    links,
    description,
    sensation,
    text: [frontmatter.name, description, sensation].filter(Boolean),
    source: relative(filePath)
  };
}

for (const room of Object.values(rooms)) {
  for (const link of room.links) {
    if (!rooms[link.to]) {
      errors.push(`${room.source}: link target does not exist: ${link.to}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const world = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  startRoom: "home.study",
  rooms
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(world, null, 2)}\n`, "utf8");

console.log(`Built ${Object.keys(rooms).length} rooms -> ${relative(outputPath)}`);

async function listMarkdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      result.push(...(await listMarkdownFiles(entryPath)));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      result.push(entryPath);
    }
  }

  return result.sort();
}

function parseDocument(source, filePath) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    errors.push(`${relative(filePath)}: missing YAML frontmatter`);
    return { frontmatter: {}, body: source };
  }

  return {
    frontmatter: parse(match[1]) ?? {},
    body: match[2]
  };
}

function normalizeLinks(links, filePath) {
  if (!Array.isArray(links)) {
    errors.push(`${relative(filePath)}: links must be a list`);
    return [];
  }

  return links.map((link, index) => {
    if (!link?.to) errors.push(`${relative(filePath)}: links[${index}] missing to`);
    if (!link?.label) errors.push(`${relative(filePath)}: links[${index}] missing label`);

    return {
      to: link.to,
      label: link.label ?? link.to,
      type: link.type ?? "link",
      aliases: link.aliases ?? [],
      bidirectional: link.bidirectional ?? false,
      oneWay: link.oneWay ?? false,
      visibleWhen: link.visibleWhen ?? [],
      enabledWhen: link.enabledWhen ?? [],
      blockedText: link.blockedText ?? null,
      arrivalText: link.arrivalText ?? null
    };
  });
}

function normalizeObjects(objects, filePath) {
  if (!Array.isArray(objects)) {
    errors.push(`${relative(filePath)}: objects must be a list`);
    return [];
  }

  return objects.map((object, index) => {
    if (typeof object === "string") {
      return {
        id: object,
        name: object,
        aliases: [object]
      };
    }

    if (!object?.id) errors.push(`${relative(filePath)}: objects[${index}] missing id`);
    if (!object?.name) errors.push(`${relative(filePath)}: objects[${index}] missing name`);

    return {
      id: object?.id ?? `object_${index}`,
      name: object?.name ?? object?.id ?? `object_${index}`,
      aliases: object?.aliases ?? [],
      tags: object?.tags ?? []
    };
  });
}

function normalizeActors(actors, filePath) {
  if (!Array.isArray(actors)) {
    errors.push(`${relative(filePath)}: actors must be a list`);
    return [];
  }

  return actors.map((actor, index) => {
    if (!actor?.id) errors.push(`${relative(filePath)}: actors[${index}] missing id`);
    if (!actor?.name) errors.push(`${relative(filePath)}: actors[${index}] missing name`);

    return {
      id: actor?.id ?? `actor_${index}`,
      name: actor?.name ?? actor?.id ?? `actor_${index}`,
      aliases: actor?.aliases ?? [],
      tags: actor?.tags ?? ["animate", "touchable"],
      description: actor?.description ?? `${actor?.name ?? actor?.id ?? "무언가"}가 있다.`,
      ambient: actor?.ambient ?? []
    };
  });
}

function section(body, heading) {
  const lines = body.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);
  if (start === -1) return "";

  const content = [];
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith("## ")) break;
    content.push(line);
  }

  return content.join("\n").trim();
}

function relative(filePath) {
  return path.relative(root, filePath);
}
