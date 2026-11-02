const fs = require('fs');
const zlib = require('zlib');

// Create standard ZIP format with forward slashes
function createZip(entries, outPath) {
  const fileRecords = [];
  const buffers = [];
  let currentOffset = 0;

  for (const entry of entries) {
    const entryName = entry.name.replace(/\\/g, '/');
    const nameBuffer = Buffer.from(entryName, 'utf8');
    const dataBuffer = entry.data;

    // CRC32 calculation
    const crc = crc32(dataBuffer);
    const compressed = zlib.deflateRawSync(dataBuffer);

    // Local file header
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0); // signature
    localHeader.writeUInt16LE(20, 4); // version needed (2.0)
    localHeader.writeUInt16LE(0, 6); // general purpose bit flag
    localHeader.writeUInt16LE(8, 8); // compression method (deflate)
    localHeader.writeUInt16LE(0, 10); // file mod time
    localHeader.writeUInt16LE(0, 12); // file mod date
    localHeader.writeUInt32LE(crc, 14); // crc-32
    localHeader.writeUInt32LE(compressed.length, 18); // compressed size
    localHeader.writeUInt32LE(dataBuffer.length, 22); // uncompressed size
    localHeader.writeUInt16LE(nameBuffer.length, 26); // file name length
    localHeader.writeUInt16LE(0, 28); // extra field length

    buffers.push(localHeader);
    buffers.push(nameBuffer);
    buffers.push(compressed);

    fileRecords.push({
      nameBuffer,
      crc,
      compressedSize: compressed.length,
      uncompressedSize: dataBuffer.length,
      offset: currentOffset,
    });

    currentOffset += 30 + nameBuffer.length + compressed.length;
  }

  // Central Directory
  const cdStartOffset = currentOffset;
  let cdSize = 0;

  for (const record of fileRecords) {
    const cdHeader = Buffer.alloc(46);
    cdHeader.writeUInt32LE(0x02014b50, 0); // signature
    cdHeader.writeUInt16LE(20, 4); // version made by
    cdHeader.writeUInt16LE(20, 6); // version needed
    cdHeader.writeUInt16LE(0, 8); // flags
    cdHeader.writeUInt16LE(8, 10); // compression method
    cdHeader.writeUInt16LE(0, 12); // mod time
    cdHeader.writeUInt16LE(0, 14); // mod date
    cdHeader.writeUInt32LE(record.crc, 16); // crc-32
    cdHeader.writeUInt32LE(record.compressedSize, 20); // compressed size
    cdHeader.writeUInt32LE(record.uncompressedSize, 24); // uncompressed size
    cdHeader.writeUInt16LE(record.nameBuffer.length, 28); // name length
    cdHeader.writeUInt16LE(0, 30); // extra length
    cdHeader.writeUInt16LE(0, 32); // comment length
    cdHeader.writeUInt16LE(0, 34); // disk start
    cdHeader.writeUInt16LE(0, 36); // internal attrs
    cdHeader.writeUInt32LE(0, 38); // external attrs
    cdHeader.writeUInt32LE(record.offset, 42); // relative offset of local header

    buffers.push(cdHeader);
    buffers.push(record.nameBuffer);

    cdSize += 46 + record.nameBuffer.length;
  }

  // End of central directory record (EOCD)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // signature
  eocd.writeUInt16LE(0, 4); // disk number
  eocd.writeUInt16LE(0, 6); // start disk
  eocd.writeUInt16LE(fileRecords.length, 8); // entries on disk
  eocd.writeUInt16LE(fileRecords.length, 10); // total entries
  eocd.writeUInt32LE(cdSize, 12); // central directory size
  eocd.writeUInt32LE(cdStartOffset, 16); // offset of central directory
  eocd.writeUInt16LE(0, 20); // comment length

  buffers.push(eocd);

  fs.writeFileSync(outPath, Buffer.concat(buffers));
}

// CRC32 table & function
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c;
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

const phpContent = fs.readFileSync('femcurrent-headless-bridge/femcurrent-headless-bridge.php');
createZip([
  {
    name: 'femcurrent-headless-bridge/femcurrent-headless-bridge.php',
    data: phpContent
  }
], 'femcurrent-headless-bridge.zip');

console.log('femcurrent-headless-bridge.zip built cleanly with standard forward slashes!');
