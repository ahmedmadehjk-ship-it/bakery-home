const http = require('http');
const fs   = require('fs');
const path = require('path');
const url  = require('url');

// Railway بيحدد البورت تلقائي
const PORT      = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'orders.json');

// تأكد إن فولدر الداتا موجود
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}
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
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
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

  // CORS headers لكل الطلبات
  const cors = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (method === 'OPTIONS') {
    res.writeHead(204, cors);
    res.end();
    return;
  }

  // ===== POST /api/orders — إضافة طلب جديد =====
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
        res.end(JSON.stringify({ status: 'error', message: e.message }));
      }
    });
    return;
  }

  // ===== GET /api/orders — جلب كل الطلبات =====
  if (pathname === '/api/orders' && method === 'GET') {
    const orders = readOrders();
    res.writeHead(200, { 'Content-Type': 'application/json', ...cors });
    res.end(JSON.stringify(orders));
    return;
  }

  // ===== PUT /api/orders/:id — تحديث حالة =====
  if (pathname.startsWith('/api/orders/') && method === 'PUT') {
    const id = parseInt(pathname.split('/')[3]);
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { status } = JSON.parse(body);
        const orders = readOrders();
        const idx = orders.findIndex(o => o.id === id);
        if (idx !== -1) orders[idx].status = status;
        saveOrders(orders);
        res.writeHead(200, { 'Content-Type': 'application/json', ...cors });
        res.end(JSON.stringify({ status: 'ok' }));
      } catch(e) {
        res.writeHead(400, { 'Content-Type': 'application/json', ...cors });
        res.end(JSON.stringify({ status: 'error' }));
      }
    });
    return;
  }

  // ===== DELETE /api/orders/:id — حذف طلب =====
  if (pathname.startsWith('/api/orders/') && method === 'DELETE') {
    const id = parseInt(pathname.split('/')[3]);
    let orders = readOrders();
    orders = orders.filter(o => o.id !== id);
    saveOrders(orders);
    res.writeHead(200, { 'Content-Type': 'application/json', ...cors });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  // ===== Static Files =====
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(__dirname, 'public', filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // جرب index.html لو الملف مش موجود (SPA fallback)
      fs.readFile(path.join(__dirname, 'public', 'index.html'), (err2, data2) => {
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
  console.log('');
  console.log('🎂 ====================================');
  console.log('   Bakary Home — السيرفر شغال!');
  console.log(`   PORT: ${PORT}`);
  console.log('🎂 ====================================');
});
