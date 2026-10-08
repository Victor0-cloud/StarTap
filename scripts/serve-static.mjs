// Local preview of a static export, behaving like the production host (Apache-style):
// /route → 301 /route/ when it is a folder, folder → index.html, unknown → 404.html with status 404.
// Run: node scripts/serve-static.mjs [dir=out] [port=3002]
import { createServer } from "node:http";
import { createReadStream, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";

const root = process.argv[2] ?? "out", port = Number(process.argv[3] ?? 3002);
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".geojson": "application/geo+json",
 ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".mp4": "video/mp4", ".pbf": "application/x-protobuf", ".txt": "text/plain; charset=utf-8",
 ".webmanifest": "application/manifest+json", ".xml": "application/xml", ".woff2": "font/woff2", ".woff": "font/woff", ".ico": "image/x-icon" };
const stat = p => { try { return statSync(p); } catch { return null; } };

function send(res, file, status = 200, req) {
 const size = stat(file).size, type = TYPES[extname(file)] ?? "application/octet-stream";
 const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range ?? "");
 if (range) { // video seeking
  const start = range[1] ? Number(range[1]) : 0, end = range[2] ? Number(range[2]) : size - 1;
  res.writeHead(206, { "Content-Type": type, "Content-Range": `bytes ${start}-${end}/${size}`, "Accept-Ranges": "bytes", "Content-Length": end - start + 1 });
  return createReadStream(file, { start, end }).pipe(res);
 }
 res.writeHead(status, { "Content-Type": type, "Content-Length": size, "Accept-Ranges": "bytes" });
 createReadStream(file).pipe(res);
}

createServer((req, res) => {
 const url = new URL(req.url, "http://x");
 const path = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, "");
 if (path.startsWith("..")) { res.writeHead(400); return res.end(); }
 const file = join(root, path), s = stat(file);
 if (s?.isDirectory()) {
  if (!url.pathname.endsWith("/")) { res.writeHead(301, { Location: url.pathname + "/" + url.search }); return res.end(); }
  if (stat(join(file, "index.html"))) return send(res, join(file, "index.html"), 200, req);
 } else if (s) return send(res, file, 200, req);
 send(res, join(root, "404.html"), 404, req);
}).listen(port, () => console.log(`Serving ${root}/ at http://localhost:${port}`));
