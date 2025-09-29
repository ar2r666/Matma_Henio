const http = require("http");
const path = require("path");
const fs = require("fs");

const PORT = Number.parseInt(process.env.PORT ?? "3000", 10);
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
};

const server = http.createServer(async (req, res) => {
  try {
    const safePath = sanitizePath(req.url ?? "/");
    const filePath = path.join(ROOT_DIR, safePath);

    if (!filePath.startsWith(ROOT_DIR)) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("403 - Forbidden");
      return;
    }

    const stats = await fs.promises.stat(filePath).catch(() => null);

    if (!stats) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404 - Not Found");
      return;
    }

    const resolvedPath = stats.isDirectory()
      ? path.join(filePath, "index.html")
      : filePath;

    const resolvedStats = await fs.promises.stat(resolvedPath).catch(() => null);

    if (!resolvedStats || !resolvedStats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404 - Not Found");
      return;
    }

    const content = await fs.promises.readFile(resolvedPath);
    const ext = path.extname(resolvedPath).toLowerCase();
    const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  } catch (error) {
    console.error("Failed to serve request", error);
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("500 - Internal Server Error");
  }
});

server.listen(PORT, () => {
  console.log(`Static server running at http://localhost:${PORT}`);
});

function sanitizePath(rawUrl) {
  const urlPath = rawUrl.split("?")[0].split("#")[0];
  if (!urlPath || urlPath === "/") {
    return "index.html";
  }

  const normalized = path.normalize(urlPath);
  return normalized.replace(/^[/\\]+/, "");
}
