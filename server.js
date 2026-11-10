// server.ts
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var port = parseInt(process.env.PORT || "3000", 10);
var host = "0.0.0.0";
app.get("/healthz", (_req, res) => {
  res.status(200).send("OK");
});
app.use(
  express.static(path.join(__dirname, "dist"), {
    maxAge: "1d",
    setHeaders: (res, filePath) => {
      if (filePath.endsWith("index.html") || filePath.endsWith("sw.js")) {
        res.setHeader("Cache-Control", "no-cache");
      }
    }
  })
);
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});
app.listen(port, host, () => {
  console.log(`Nur al-Salat production server running on http://${host}:${port}`);
});
