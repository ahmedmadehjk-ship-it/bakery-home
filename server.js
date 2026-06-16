const http = require('http');
const fs   = require('fs');
const path = require('path');
const url  = require('url');

const PORT      = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'orders.json');

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico':  'image/x-icon',
  '.svg':  'image/svg+xml',
};

function readOrders() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return []; }
}
function saveOrders(orders) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2));
}

const server = http.createServer((req, res) => {
  const parsed   = url.parse(req.url, true);
  const method   = req.method;
  const pathname = parsed.pathname;

  const cors = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (method === 'OPTIONS') { res.writeHead(204, cors); res.end(); return; }

  // POST /api/orders
  if (pathname === '/api/orders' && method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const order  = JSON.parse(body);
        order.id     = Date.now();
        order.date   = new Date().toLocaleString('ar-EG');
        order.status = 'جديد';
        const orders = readOrders();
        orders.push(order);
        saveOrders(orders);
        res.writeHead(200, { 'Content-Type': 'application/json', ...cors });
        res.end(JSON.stringify({ status: 'ok', id: order.id }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json', ...cors });
        res.end(JSON.stringify({ status: 'error' }));
      }
    });
    return;
  }

  // GET /api/orders
  if (pathname === '/api/orders' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json', ...cors });
    res.end(JSON.stringify(readOrders()));
    return;
  }

  // PUT /api/orders/:id
  if (pathname.startsWith('/api/orders/') && method === 'PUT') {
    const id = parseInt(pathname.split('/')[3]);
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { status } = JSON.parse(body);
      const orders = readOrders();
      const idx = orders.findIndex(o => o.id === id);
      if (idx !== -1) orders[idx].status = status;
      saveOrders(orders);
      res.writeHead(200, { 'Content-Type': 'application/json', ...cors });
      res.end(JSON.stringify({ status: 'ok' }));
    });
    return;
  }

  // DELETE /api/orders/:id
  if (pathname.startsWith('/api/orders/') && method === 'DELETE') {
    const id = parseInt(pathname.split('/')[3]);
    let orders = readOrders().filter(o => o.id !== id);
    saveOrders(orders);
    res.writeHead(200, { 'Content-Type': 'application/json', ...cors });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  // Static files — بيدور في نفس الفولدر مباشرة
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(__dirname, filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // fallback لـ index.html
      fs.readFile(path.join(__dirname, 'index.html'), (err2, data2) => {
        if (err2) { res.writeHead(404); res.end('Not Found'); return; }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data2);
      });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🎂 Bakary Home running on port ${PORT}`);
});
