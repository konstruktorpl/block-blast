const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const PORT = process.env.PORT || 8080;
const ROOT = __dirname;
let publicTunnelUrl = null;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

function getLocalLanIps() {
  const interfaces = os.networkInterfaces();
  const candidates = [];
  for (const name of Object.keys(interfaces)) {
    if (/vethernet|wsl|docker|vbox|vmware/i.test(name)) continue;
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        candidates.push({ name, address: iface.address });
      }
    }
  }
  if (candidates.length === 0) {
    candidates.push({ name: 'Localhost', address: 'localhost' });
  }
  return candidates;
}

// --- Minimal Pure-JS QR Code Generator (Byte mode, ECC Level L, Versions 1..4) ---
function generateQrSvg(text) {
  const bytes = Buffer.from(text, 'utf8');
  // Version table for ECC Level L (total data codewords, ec codewords, size)
  const VERSIONS = [
    null,
    { v: 1, size: 21, dataBytes: 19, ecBytes: 7, align: [] },
    { v: 2, size: 25, dataBytes: 34, ecBytes: 10, align: [6, 18] },
    { v: 3, size: 29, dataBytes: 55, ecBytes: 15, align: [6, 22] },
    { v: 4, size: 33, dataBytes: 80, ecBytes: 20, align: [6, 26] }
  ];

  let ver = VERSIONS[2];
  for (let v = 1; v <= 4; v++) {
    if (bytes.length + 2 <= VERSIONS[v].dataBytes) {
      ver = VERSIONS[v];
      break;
    }
  }

  // Build bit stream: Mode 0100 (4 bits), char count (8 bits), data, terminator
  const bits = [];
  const pushBits = (val, len) => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1);
  };
  pushBits(0b0100, 4);
  pushBits(bytes.length, 8);
  for (const b of bytes) pushBits(b, 8);
  const maxBits = ver.dataBytes * 8;
  for (let i = 0; i < 4 && bits.length < maxBits; i++) bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);

  const data = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
    data.push(b);
  }
  const pads = [0xec, 0x11];
  let padIdx = 0;
  while (data.length < ver.dataBytes) {
    data.push(pads[padIdx % 2]);
    padIdx++;
  }

  // Galois Field GF(256) for Reed-Solomon
  const exp = new Uint8Array(512);
  const log = new Uint8Array(256);
  let x = 1;
  for (let i = 0; i < 255; i++) {
    exp[i] = x;
    log[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) exp[i] = exp[i - 255];
  const gfMul = (a, b) => (a === 0 || b === 0 ? 0 : exp[log[a] + log[b]]);

  // Generator polynomial of degree ecBytes
  let gen = [1];
  for (let i = 0; i < ver.ecBytes; i++) {
    const next = new Array(gen.length + 1).fill(0);
    for (let j = 0; j < gen.length; j++) {
      next[j] ^= gen[j];
      next[j + 1] ^= gfMul(gen[j], exp[i]);
    }
    gen = next;
  }

  const msg = new Uint8Array(ver.dataBytes + ver.ecBytes);
  msg.set(data, 0);
  for (let i = 0; i < ver.dataBytes; i++) {
    const coef = msg[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        msg[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  const codewords = [...data, ...msg.slice(ver.dataBytes)];

  const N = ver.size;
  const grid = Array.from({ length: N }, () => Array(N).fill(null));
  const reserved = Array.from({ length: N }, () => Array(N).fill(false));

  const placeFinder = (r0, c0) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = r0 + r;
        const cc = c0 + c;
        if (rr < 0 || rr >= N || cc < 0 || cc >= N) continue;
        const inOuter = r >= 0 && r <= 6 && c >= 0 && c <= 6 && (r === 0 || r === 6 || c === 0 || c === 6);
        const inInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        grid[rr][cc] = inOuter || inInner ? 1 : 0;
        reserved[rr][cc] = true;
      }
    }
  };
  placeFinder(0, 0);
  placeFinder(0, N - 7);
  placeFinder(N - 7, 0);

  if (ver.align.length > 0) {
    const c0 = ver.align[1];
    const r0 = ver.align[1];
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        const isDark = Math.max(Math.abs(r), Math.abs(c)) !== 1;
        grid[r0 + r][c0 + c] = isDark ? 1 : 0;
        reserved[r0 + r][c0 + c] = true;
      }
    }
  }

  // Timing patterns
  for (let i = 8; i < N - 8; i++) {
    grid[6][i] = i % 2 === 0 ? 1 : 0;
    reserved[6][i] = true;
    grid[i][6] = i % 2 === 0 ? 1 : 0;
    reserved[i][6] = true;
  }

  // Reserve format info areas + dark module
  for (let i = 0; i < 9; i++) {
    if (i < N) {
      reserved[8][i] = true;
      reserved[i][8] = true;
    }
  }
  for (let i = 0; i < 8; i++) {
    reserved[8][N - 1 - i] = true;
    reserved[N - 1 - i][8] = true;
  }
  grid[N - 8][8] = 1;
  reserved[N - 8][8] = true;

  // Place data bits in upward/downward 2-column zig-zag
  const allBits = [];
  for (const cw of codewords) {
    for (let b = 7; b >= 0; b--) allBits.push((cw >> b) & 1);
  }
  let bitIdx = 0;
  let upward = true;
  for (let col = N - 1; col > 0; col -= 2) {
    if (col === 6) col--;
    for (let step = 0; step < N; step++) {
      const r = upward ? N - 1 - step : step;
      for (let dc = 0; dc < 2; dc++) {
        const c = col - dc;
        if (!reserved[r][c]) {
          const bit = bitIdx < allBits.length ? allBits[bitIdx++] : 0;
          // Mask 0: (r + c) % 2 === 0
          grid[r][c] = bit ^ ((r + c) % 2 === 0 ? 1 : 0);
        }
      }
    }
    upward = !upward;
  }

  // Format information for ECC Level L (01) and Mask 0 (000) -> 0x77c4
  const fmt = 0x77c4;
  const fmtBits = [];
  for (let i = 0; i < 15; i++) fmtBits.push((fmt >> i) & 1);

  const fCoords1 = [
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
    [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8]
  ];
  fCoords1.forEach(([r, c], idx) => { grid[r][c] = fmtBits[14 - idx]; });

  for (let i = 0; i < 7; i++) grid[N - 1 - i][8] = fmtBits[14 - i];
  for (let i = 7; i < 15; i++) grid[8][N - 15 + i] = fmtBits[14 - i];

  // Render crisp SVG
  let rects = '';
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (grid[r][c]) {
        rects += `<rect x="${c + 2}" y="${r + 2}" width="1" height="1" fill="#141d4b"/>`;
      }
    }
  }
  const viewSize = N + 4;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewSize} ${viewSize}" shape-rendering="crispEdges"><rect width="${viewSize}" height="${viewSize}" fill="#ffffff"/>${rects}</svg>`;
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

  if (parsedUrl.pathname === '/api/lan-info') {
    const ips = getLocalLanIps();
    const endpoints = [];

    if (publicTunnelUrl) {
      endpoints.push({
        name: '🌍 Интернет (4G/5G/Любой Wi-Fi)',
        ip: '🌍 4G / Интернет',
        url: publicTunnelUrl,
        qrSvg: generateQrSvg(publicTunnelUrl)
      });
    }

    ips.forEach((item) => {
      const url = `http://${item.address}:${PORT}`;
      endpoints.push({
        name: item.name,
        ip: item.address,
        url,
        qrSvg: generateQrSvg(url)
      });
    });

    const primary = endpoints[0];
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(
      JSON.stringify({
        ip: primary.ip,
        port: PORT,
        url: primary.url,
        qrSvg: primary.qrSvg,
        publicUrl: publicTunnelUrl,
        endpoints
      })
    );
    return;
  }

  let pathname = parsedUrl.pathname === '/' ? '/index.html' : parsedUrl.pathname;
  const safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(ROOT, safePath);

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    res.end(content);
  });
});

function startPublicTunnel() {
  const sshCandidates = [
    'C:\\Program Files\\Git\\usr\\bin\\ssh.exe',
    'C:\\Windows\\System32\\OpenSSH\\ssh.exe',
    'ssh'
  ];
  const sshBin = sshCandidates.find((p) => p === 'ssh' || fs.existsSync(p));
  if (!sshBin) return;

  const child = spawn(
    sshBin,
    [
      '-o', 'StrictHostKeyChecking=no',
      '-o', 'UserKnownHostsFile=/dev/null',
      '-o', 'ServerAliveInterval=30',
      '-R', `80:localhost:${PORT}`,
      'nokey@localhost.run'
    ],
    { stdio: ['ignore', 'pipe', 'pipe'] }
  );

  const onData = (chunk) => {
    const text = chunk.toString('utf8');
    const match = text.match(/https:\/\/[a-z0-9-]+\.lhr\.life/i);
    if (match && match[0] !== publicTunnelUrl) {
      publicTunnelUrl = match[0];
      console.log(`🌍 ПУБЛИЧНАЯ ССЫЛКА (4G/5G/Интернет): ${publicTunnelUrl}`);
      console.log('====================================================');
    }
  };

  child.stdout.on('data', onData);
  child.stderr.on('data', onData);
  child.on('error', () => {});
  child.on('close', () => {
    publicTunnelUrl = null;
    setTimeout(startPublicTunnel, 2000);
  });
}

server.listen(PORT, '0.0.0.0', () => {
  const ips = getLocalLanIps();
  console.log('====================================================');
  console.log('🎮 BLOCK BLAST! (iOS / iPhone Edition) Запущен!');
  console.log(`💻 На компьютере: http://localhost:${PORT}`);
  ips.forEach((item) => {
    console.log(`📱 На iPhone (${item.name}): http://${item.address}:${PORT}`);
  });
  console.log('⏳ Создаём публичную HTTPS-ссылку для игры через мобильный интернет (4G/5G)...');
  startPublicTunnel();
});
