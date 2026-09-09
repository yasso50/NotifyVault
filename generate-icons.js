import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, r, g, b, isMaskable = false) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // CRC table
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const typeAndData = Buffer.concat([typeBuf, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(typeAndData), 0);
    return Buffer.concat([len, typeAndData, crc]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw pixel data: each scanline starts with 0 (filter type none), then RGBA pixels
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * (isMaskable ? 0.48 : 0.42);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // filter byte
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Bell shape icon logic
      const inBellBody = dist < radius * 0.7 && y > cy - radius * 0.4 && y < cy + radius * 0.4;
      const inBellTop = Math.sqrt(dx * dx + (y - (cy - radius * 0.5)) ** 2) < radius * 0.2;
      const inBellBase = Math.abs(dx) < radius * 0.55 && Math.abs(y - (cy + radius * 0.35)) < radius * 0.1;
      const inBellClapper = Math.sqrt(dx * dx + (y - (cy + radius * 0.55)) ** 2) < radius * 0.15;
      const isBell = inBellBody || inBellTop || inBellBase || inBellClapper;

      // Badge dot
      const isBadge = Math.sqrt((x - (cx + radius * 0.5)) ** 2 + (y - (cy - radius * 0.45)) ** 2) < radius * 0.2;

      if (isBadge) {
        rawData[pxOffset] = 239;     // R (red dot)
        rawData[pxOffset + 1] = 68;  // G
        rawData[pxOffset + 2] = 68;  // B
        rawData[pxOffset + 3] = 255; // A
      } else if (isBell) {
        rawData[pxOffset] = 255;     // White bell icon
        rawData[pxOffset + 1] = 255;
        rawData[pxOffset + 2] = 255;
        rawData[pxOffset + 3] = 255;
      } else {
        // Background: indigo gradient #4f46e5 to #312e81
        const gradFactor = (x + y) / (width + height);
        rawData[pxOffset] = Math.round(79 * (1 - gradFactor) + 49 * gradFactor);
        rawData[pxOffset + 1] = Math.round(70 * (1 - gradFactor) + 46 * gradFactor);
        rawData[pxOffset + 2] = Math.round(229 * (1 - gradFactor) + 129 * gradFactor);
        rawData[pxOffset + 3] = 255;
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

fs.writeFileSync('public/pwa-192x192.png', createPNG(192, 192, 79, 70, 229, false));
fs.writeFileSync('public/pwa-512x512.png', createPNG(512, 512, 79, 70, 229, false));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPNG(512, 512, 79, 70, 229, true));
fs.writeFileSync('public/apple-touch-icon.png', createPNG(180, 180, 79, 70, 229, false));

console.log('PNG icons created successfully!');
