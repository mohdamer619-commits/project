import fs from 'fs';
import zlib from 'zlib';

function createPng(width, height, r, g, b) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(4 + 4 + len + 4);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4);
    data.copy(buf, 8);
    const crc = crc32(buf.subarray(4, 8 + len));
    buf.writeInt32BE(crc, 8 + len);
    return buf;
  }

  // Scanlines with filter byte 0
  const rowSize = 1 + width * 3;
  const rawData = Buffer.alloc(height * rowSize);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // no filter
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 3;
      // Draw a circular gold highlight in center
      const dx = x - width / 2;
      const dy = y - height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < width * 0.35 && !(dist < width * 0.28 && dx > -width * 0.1 && dy < width * 0.1)) {
        // Gold crescent
        rawData[pxOffset] = 234;
        rawData[pxOffset + 1] = 179;
        rawData[pxOffset + 2] = 8;
      } else {
        // Deep emerald background
        rawData[pxOffset] = r;
        rawData[pxOffset + 1] = g;
        rawData[pxOffset + 2] = b;
      }
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c = c ^ buf[i];
    for (let j = 0; j < 8; j++) {
      c = (c >>> 1) ^ (0xEDB88320 & -(c & 1));
    }
  }
  return ~c;
}

const pwa192 = createPng(192, 192, 6, 78, 59);
const pwa512 = createPng(512, 512, 6, 78, 59);
const pwaMaskable = createPng(512, 512, 4, 44, 34);
const appleIcon = createPng(180, 180, 6, 78, 59);
const favicon = createPng(64, 64, 6, 78, 59);

fs.writeFileSync('public/pwa-192x192.png', pwa192);
fs.writeFileSync('public/pwa-512x512.png', pwa512);
fs.writeFileSync('public/pwa-maskable-512x512.png', pwaMaskable);
fs.writeFileSync('public/apple-touch-icon.png', appleIcon);
fs.writeFileSync('public/favicon.ico', favicon);
console.log('Generated PNG icons successfully');
