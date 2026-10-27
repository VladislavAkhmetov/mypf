// Yandex Cloud Function (Node.js 18+): likes and comments for the notes feed.
//
// Environment variables:
//   YDB_ENDPOINT   e.g. grpcs://ydb.serverless.yandexcloud.net:2135
//   YDB_DATABASE   e.g. /ru-central1/b1g.../etn...
//   ALLOWED_ORIGIN site origin for CORS, e.g. https://example.ru (use * only for testing)
//   MODERATION     "off" publishes comments immediately; anything else keeps them hidden
//                  until approved: UPDATE comments SET visible = true WHERE id = "...";
//
// The function's service account needs the role ydb.editor on the database.

const { Driver, MetadataAuthService, TypedValues, TypedData } = require("ydb-sdk");

const NOTE_ID = /^[a-z0-9-]{1,64}$/;
const COMMENT_ID = /^c-[a-z0-9-]{4,40}$/;

let driverPromise = null;

function getDriver() {
  if (!driverPromise) {
    driverPromise = (async () => {
      const driver = new Driver({
        endpoint: process.env.YDB_ENDPOINT,
        database: process.env.YDB_DATABASE,
        authService: new MetadataAuthService(),
      });
      if (!(await driver.ready(10000))) {
        driverPromise = null;
        throw new Error("YDB driver is not ready");
      }
      return driver;
    })();
  }
  return driverPromise;
}

async function query(text, params = {}) {
  const driver = await getDriver();
  return driver.tableClient.withSession(session => session.executeQuery(text, params));
}

const toNumber = value => (value && typeof value === "object" && "toNumber" in value ? value.toNumber() : Number(value));

function rows(result, index) {
  const set = result.resultSets[index];
  return set ? TypedData.createNativeObjects(set) : [];
}

function respond(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

function cleanText(value, max) {
  return typeof value === "string" ? value.replace(/\s+\n/g, "\n").trim().slice(0, max) : "";
}

async function readState() {
  const result = await query(`
    SELECT note, likes FROM likes;
    SELECT note, id, author, body, created FROM comments WHERE visible = true ORDER BY created LIMIT 500;
  `);
  const likes = {};
  for (const row of rows(result, 0)) likes[row.note] = toNumber(row.likes);
  const comments = rows(result, 1).map(row => ({
    id: row.id,
    note: row.note,
    author: row.author,
    body: row.body,
    created: new Date(row.created).toISOString(),
  }));
  return { likes, comments };
}

async function like(note, delta) {
  await query(
    `
    DECLARE $note AS Utf8;
    DECLARE $delta AS Int64;
    $current = (SELECT likes FROM likes WHERE note = $note);
    UPSERT INTO likes (note, likes) VALUES ($note, MAX_OF(COALESCE($current, 0) + $delta, 0));
  `,
    { $note: TypedValues.utf8(note), $delta: TypedValues.int64(delta) },
  );
  return {};
}

async function comment(input) {
  const visible = (process.env.MODERATION || "").toLowerCase() === "off";
  await query(
    `
    DECLARE $note AS Utf8;
    DECLARE $id AS Utf8;
    DECLARE $author AS Utf8;
    DECLARE $body AS Utf8;
    DECLARE $created AS Timestamp;
    DECLARE $visible AS Bool;
    UPSERT INTO comments (note, id, author, body, created, visible)
    VALUES ($note, $id, $author, $body, $created, $visible);
  `,
    {
      $note: TypedValues.utf8(input.note),
      $id: TypedValues.utf8(input.id),
      $author: TypedValues.utf8(input.author),
      $body: TypedValues.utf8(input.body),
      $created: TypedValues.timestamp(new Date()),
      $visible: TypedValues.bool(visible),
    },
  );
  return { visible };
}

module.exports.handler = async function handler(event) {
  try {
    if (event.httpMethod === "OPTIONS") return respond(204, {});
    if (event.httpMethod === "GET") return respond(200, await readState());
    if (event.httpMethod !== "POST") return respond(405, { error: "method" });

    const raw = event.isBase64Encoded ? Buffer.from(event.body || "", "base64").toString("utf8") : event.body || "";
    if (raw.length > 4000) return respond(413, { error: "too large" });
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return respond(400, { error: "json" });
    }
    if (!data || typeof data.note !== "string" || !NOTE_ID.test(data.note)) return respond(400, { error: "note" });

    if (data.action === "like") {
      if (data.delta !== 1 && data.delta !== -1) return respond(400, { error: "delta" });
      return respond(200, await like(data.note, data.delta));
    }

    if (data.action === "comment") {
      // Honeypot field: real visitors never fill it.
      if (data.website) return respond(200, { visible: false });
      const id = typeof data.id === "string" && COMMENT_ID.test(data.id) ? data.id : null;
      const author = cleanText(data.author, 40) || "Гость";
      const body = cleanText(data.body, 1000);
      if (!id || body.length < 2) return respond(400, { error: "comment" });
      return respond(200, await comment({ note: data.note, id, author, body }));
    }

    return respond(400, { error: "action" });
  } catch (error) {
    console.error(error);
    return respond(500, { error: "internal" });
  }
};
