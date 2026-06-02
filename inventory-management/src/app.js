// StockPro – Inventory Management System
// Main application logic

const CATEGORIES = ['Electronics', 'Accessories', 'Furniture', 'Clothing', 'Food', 'Other'];
const STATUS_COLORS = {
  delivered: 'success',
  shipped: 'info',
  processing: 'warning',
  pending: 'gray',
  cancelled: 'danger'
};
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'ti-layout-dashboard' },
  { id: 'products',  label: 'Products',  icon: 'ti-package' },
  { id: 'customers', label: 'Customers', icon: 'ti-users' },
  { id: 'orders',    label: 'Orders',    icon: 'ti-shopping-cart' },
  { id: 'reports',   label: 'Reports',   icon: 'ti-chart-bar' },
];

// ── State ──────────────────────────────────────────────────────────────────
let state = {
  page: 'dashboard',
  search: '',
  nextProductId: 8,
  nextCustomerId: 5,
  nextOrderId: 5,
  ...JSON.parse(localStorage.getItem('stockpro_data') || 'null') || {
    products: INITIAL_DATA.products,
    customers: INITIAL_DATA.customers,
    orders: INITIAL_DATA.orders,
  }
};

function persist() {
  localStorage.setItem('stockpro_data', JSON.stringify({
    products: state.products,
    customers: state.customers,
    orders: state.orders,
  }));
}

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = n => '₹' + Number(n).toLocaleString('en-IN');
const initials = name => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
const escape = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

// ── Toast ──────────────────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  const icon = type === 'success' ? 'ti-check' : 'ti-alert-circle';
  document.getElementById('toast-root').innerHTML =
    `<div class="toast toast-${type}"><i class="ti ${icon}"></i>${escape(msg)}</div>`;
  setTimeout(() => { document.getElementById('toast-root').innerHTML = ''; }, 2600);
}

// ── Nav ────────────────────────────────────────────────────────────────────
function renderNav() {
  document.getElementById('nav').innerHTML = NAV_ITEMS.map(n =>
    `<div class="nav-item${state.page === n.id ? ' active' : ''}" onclick="navigate('${n.id}')">
       <i class="ti ${n.icon}"></i>${n.label}
     </div>`
  ).join('');
}

function navigate(page) {
  state.page = page;
  state.search = '';
  renderNav();
  document.getElementById('page-title').textContent =
    NAV_ITEMS.find(n => n.id === page)?.label || '';
  renderPage();
}

function renderPage() {
  const actions = document.getElementById('topbar-actions');
  switch (state.page) {
    case 'dashboard':
      actions.innerHTML = '';
      renderDashboard();
      break;
    case 'products':
      actions.innerHTML = `<button class="btn btn-primary" onclick="openProductModal()"><i class="ti ti-plus"></i> Add Product</button>`;
      renderProducts();
      break;
    case 'customers':
      actions.innerHTML = `<button class="btn btn-primary" onclick="openCustomerModal()"><i class="ti ti-plus"></i> Add Customer</button>`;
      renderCustomers();
      break;
    case 'orders':
      actions.innerHTML = `<button class="btn btn-primary" onclick="openOrderModal()"><i class="ti ti-plus"></i> New Order</button>`;
      renderOrders();
      break;
    case 'reports':
      actions.innerHTML = '';
      renderReports();
      break;
  }
}

// ── Dashboard ──────────────────────────────────────────────────────────────
function renderDashboard() {
  const totalValue   = state.products.reduce((a, p) => a + p.qty * p.cost, 0);
  const lowStock     = state.products.filter(p => p.qty > 0 && p.qty <= p.minQty).length;
  const outStock     = state.products.filter(p => p.qty === 0).length;
  const totalRevenue = state.orders.reduce((a, o) => a + o.total, 0);
  const pending      = state.orders.filter(o => o.status === 'pending' || o.status === 'processing').length;

  const categoryRows = CATEGORIES
    .filter(c => state.products.some(p => p.category === c))
    .map(c => {
      const items    = state.products.filter(p => p.category === c);
      const totalQty = items.reduce((a, p) => a + p.qty, 0);
      const val      = items.reduce((a, p) => a + p.qty * p.price, 0);
      const pct      = Math.min(100, Math.round(totalQty / 200 * 100));
      return `<div style="margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px">
          <span>${escape(c)} <span class="tag">${items.length} items</span></span>
          <span style="color:var(--muted)">${totalQty} units · ${fmt(val)}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${pct}%;background:var(--primary)"></div>
        </div>
      </div>`;
    }).join('');

  const recentOrders = state.orders.slice().reverse().slice(0, 5).map(o => {
    const c = state.customers.find(x => x.id === o.customerId);
    return `<tr>
      <td style="font-weight:500">${escape(o.id)}</td>
      <td>${c ? escape(c.name) : '—'}</td>
      <td><span class="badge badge-${STATUS_COLORS[o.status]}">${o.status}</span></td>
      <td>${fmt(o.total)}</td>
    </tr>`;
  }).join('');

  const alertItems = state.products.filter(p => p.qty <= p.minQty).slice(0, 6).map(p =>
    `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 16px;border-bottom:0.5px solid var(--border)">
       <div>
         <div style="font-size:13px;font-weight:500">${escape(p.name)}</div>
         <div style="font-size:11px;color:var(--muted)">${escape(p.sku)}</div>
       </div>
       <span class="badge badge-${p.qty === 0 ? 'danger' : 'warning'}">${p.qty === 0 ? 'Out of stock' : p.qty + ' left'}</span>
     </div>`
  ).join('') || `<div class="empty-state"><i class="ti ti-circle-check"></i><p>All items well stocked</p></div>`;

  document.getElementById('content').innerHTML = `
    <div class="stats-grid">
      <div class="stat-card stat-info">
        <div class="stat-label"><i class="ti ti-package"></i> Total Products</div>
        <div class="stat-value">${state.products.length}</div>
        <div class="stat-sub">${state.products.filter(p => p.qty > 0).length} in stock</div>
      </div>
      <div class="stat-card stat-success">
        <div class="stat-label"><i class="ti ti-currency-rupee"></i> Inventory Value</div>
        <div class="stat-value">${fmt(totalValue)}</div>
        <div class="stat-sub">at cost price</div>
      </div>
      <div class="stat-card stat-warning">
        <div class="stat-label"><i class="ti ti-alert-triangle"></i> Low Stock</div>
        <div class="stat-value">${lowStock}</div>
        <div class="stat-sub">${outStock} out of stock</div>
      </div>
      <div class="stat-card stat-info">
        <div class="stat-label"><i class="ti ti-shopping-cart"></i> Total Revenue</div>
        <div class="stat-value">${fmt(totalRevenue)}</div>
        <div class="stat-sub">${pending} orders pending</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div class="card">
        <div class="card-header"><h3>Recent Orders</h3>
          <button class="btn btn-sm" onclick="navigate('orders')">View all</button>
        </div>
        <div class="card-body">
          <table>
            <thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Total</th></tr></thead>
            <tbody>${recentOrders}</tbody>
          </table>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3>Stock Alerts</h3>
          <button class="btn btn-sm" onclick="navigate('products')">View all</button>
        </div>
        <div class="card-body">${alertItems}</div>
      </div>
      <div class="card" style="grid-column:1/-1">
        <div class="card-header"><h3>Inventory by Category</h3></div>
        <div class="card-body" style="padding:16px">${categoryRows}</div>
      </div>
    </div>`;
}

// ── Products ───────────────────────────────────────────────────────────────
function renderProducts() {
  const q = state.search.toLowerCase();
  const list = state.products.filter(p =>
    !q || p.name.toLowerCase().includes(q) ||
    p.sku.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q)
  );

  const rows = list.length
    ? list.map(p => `
      <tr>
        <td><code style="font-size:11px;background:var(--bg);padding:2px 5px;border-radius:3px">${escape(p.sku)}</code></td>
        <td><div style="font-weight:500">${escape(p.name)}</div>
            <div style="font-size:11px;color:var(--muted)">${escape(p.supplier || '—')}</div></td>
        <td><span class="tag">${escape(p.category)}</span></td>
        <td style="font-weight:500">${p.qty}</td>
        <td style="color:var(--muted)">${p.minQty}</td>
        <td>${fmt(p.price)}</td>
        <td style="color:var(--muted)">${escape(p.location || '—')}</td>
        <td>
          <span class="badge badge-${p.qty === 0 ? 'danger' : p.qty <= p.minQty ? 'warning' : 'success'}">
            ${p.qty === 0 ? 'Out of stock' : p.qty <= p.minQty ? 'Low stock' : 'In stock'}
          </span>
        </td>
        <td>
          <div style="display:flex;gap:4px">
            <button class="btn btn-sm" onclick="openProductModal(${p.id})" title="Edit"><i class="ti ti-edit"></i></button>
            <button class="btn btn-sm" onclick="adjustStock(${p.id})" title="Adjust stock"><i class="ti ti-arrows-up-down"></i></button>
            <button class="btn btn-sm btn-danger" onclick="deleteProduct(${p.id})" title="Delete"><i class="ti ti-trash"></i></button>
          </div>
        </td>
      </tr>`).join('')
    : `<tr><td colspan="9"><div class="empty-state"><i class="ti ti-package-off"></i><p>No products found</p></div></td></tr>`;

  document.getElementById('content').innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3>Products <span class="tag">${list.length}</span></h3>
        <input type="text" placeholder="Search by name, SKU, category…" value="${escape(state.search)}"
          oninput="state.search=this.value;renderProducts()"
          style="width:220px;padding:6px 10px;border:0.5px solid var(--border-hover);border-radius:var(--radius);background:var(--bg);color:var(--text);font-size:13px;font-family:inherit;outline:none" />
      </div>
      <div class="card-body" style="overflow-x:auto">
        <table>
          <thead>
            <tr>
              <th>SKU</th><th>Product</th><th>Category</th><th>Qty</th>
              <th>Min Qty</th><th>Price</th><th>Location</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}

function openProductModal(id) {
  const p = id != null ? state.products.find(x => x.id === id) : null;
  const catOptions = CATEGORIES.map(c =>
    `<option${p?.category === c ? ' selected' : ''}>${escape(c)}</option>`
  ).join('');

  openModal(`
    <div class="modal">
      <div class="modal-header">
        <h3>${p ? 'Edit Product' : 'Add Product'}</h3>
        <button class="btn btn-sm" onclick="closeModal()"><i class="ti ti-x"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group">
            <label>Product Name *</label>
            <input id="f-name" value="${escape(p?.name || '')}" placeholder="e.g. Wireless Mouse" />
          </div>
          <div class="form-group">
            <label>SKU *</label>
            <input id="f-sku" value="${escape(p?.sku || '')}" placeholder="e.g. WM-001" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Category</label>
            <select id="f-cat">${catOptions}</select>
          </div>
          <div class="form-group">
            <label>Supplier</label>
            <input id="f-supplier" value="${escape(p?.supplier || '')}" placeholder="Supplier name" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Quantity *</label>
            <input id="f-qty" type="number" value="${p?.qty ?? ''}" placeholder="0" min="0" />
          </div>
          <div class="form-group">
            <label>Min Qty (low-stock alert)</label>
            <input id="f-minqty" type="number" value="${p?.minQty ?? ''}" placeholder="5" min="0" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Selling Price (₹) *</label>
            <input id="f-price" type="number" value="${p?.price ?? ''}" placeholder="999" min="0" />
          </div>
          <div class="form-group">
            <label>Cost Price (₹)</label>
            <input id="f-cost" type="number" value="${p?.cost ?? ''}" placeholder="500" min="0" />
          </div>
        </div>
        <div class="form-group">
          <label>Storage Location</label>
          <input id="f-loc" value="${escape(p?.location || '')}" placeholder="e.g. A-01" />
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveProduct(${id ?? 'null'})">${p ? 'Update' : 'Add Product'}</button>
      </div>
    </div>`);
}

function saveProduct(id) {
  const name    = document.getElementById('f-name').value.trim();
  const sku     = document.getElementById('f-sku').value.trim();
  const qty     = parseInt(document.getElementById('f-qty').value)    || 0;
  const minQty  = parseInt(document.getElementById('f-minqty').value) || 0;
  const price   = parseInt(document.getElementById('f-price').value)  || 0;
  const cost    = parseInt(document.getElementById('f-cost').value)   || 0;
  const cat     = document.getElementById('f-cat').value;
  const supplier= document.getElementById('f-supplier').value.trim();
  const location= document.getElementById('f-loc').value.trim();

  if (!name || !sku || !price) { showToast('Fill all required fields (*)', 'danger'); return; }

  if (id != null) {
    const p = state.products.find(x => x.id === id);
    Object.assign(p, { name, sku, category: cat, supplier, qty, minQty, price, cost, location });
    showToast('Product updated');
  } else {
    state.products.push({ id: state.nextProductId++, name, sku, category: cat, supplier, qty, minQty, price, cost, location });
    showToast('Product added');
  }
  persist(); closeModal(); renderProducts();
}

function deleteProduct(id) {
  if (!confirm('Delete this product? This cannot be undone.')) return;
  state.products = state.products.filter(p => p.id !== id);
  persist(); showToast('Product deleted', 'danger'); renderProducts();
}

function adjustStock(id) {
  const p = state.products.find(x => x.id === id);
  openModal(`
    <div class="modal">
      <div class="modal-header">
        <h3>Adjust Stock: ${escape(p.name)}</h3>
        <button class="btn btn-sm" onclick="closeModal()"><i class="ti ti-x"></i></button>
      </div>
      <div class="modal-body">
        <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg);border-radius:var(--radius);margin-bottom:16px;border:0.5px solid var(--border)">
          <i class="ti ti-package" style="font-size:24px;color:var(--primary)"></i>
          <div>
            <div style="font-size:13px;color:var(--muted)">Current stock</div>
            <div style="font-size:22px;font-weight:500">${p.qty} units</div>
          </div>
        </div>
        <div class="form-group">
          <label>Adjustment type</label>
          <select id="adj-type">
            <option value="add">Add stock (+)</option>
            <option value="remove">Remove stock (–)</option>
            <option value="set">Set exact quantity</option>
          </select>
        </div>
        <div class="form-group">
          <label>Quantity</label>
          <input id="adj-qty" type="number" placeholder="Enter quantity" min="0" />
        </div>
        <div class="form-group">
          <label>Reason (optional)</label>
          <input id="adj-reason" placeholder="e.g. New shipment, Damage write-off…" />
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="applyAdjustment(${id})">Apply</button>
      </div>
    </div>`);
}

function applyAdjustment(id) {
  const p    = state.products.find(x => x.id === id);
  const type = document.getElementById('adj-type').value;
  const qty  = parseInt(document.getElementById('adj-qty').value) || 0;
  if (!qty && type !== 'set') { showToast('Enter a quantity', 'danger'); return; }

  if      (type === 'add')    p.qty += qty;
  else if (type === 'remove') p.qty = Math.max(0, p.qty - qty);
  else                        p.qty = Math.max(0, qty);

  persist(); showToast(`Stock updated to ${p.qty} units`); closeModal(); renderProducts();
}

// ── Customers ──────────────────────────────────────────────────────────────
function renderCustomers() {
  const q = state.search.toLowerCase();
  const list = state.customers.filter(c =>
    !q || c.name.toLowerCase().includes(q) ||
    c.email.toLowerCase().includes(q) ||
    c.city.toLowerCase().includes(q)
  );

  const rows = list.length
    ? list.map(c => `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div class="avatar">${initials(c.name)}</div>
            <span style="font-weight:500">${escape(c.name)}</span>
          </div>
        </td>
        <td style="color:var(--muted)">${escape(c.email)}</td>
        <td style="color:var(--muted)">${escape(c.phone || '—')}</td>
        <td>${escape(c.city || '—')}</td>
        <td>${c.totalOrders}</td>
        <td style="font-weight:500">${fmt(c.totalSpent)}</td>
        <td>
          <div style="display:flex;gap:4px">
            <button class="btn btn-sm" onclick="openCustomerModal(${c.id})"><i class="ti ti-edit"></i></button>
            <button class="btn btn-sm btn-danger" onclick="deleteCustomer(${c.id})"><i class="ti ti-trash"></i></button>
          </div>
        </td>
      </tr>`).join('')
    : `<tr><td colspan="7"><div class="empty-state"><i class="ti ti-users-off"></i><p>No customers found</p></div></td></tr>`;

  document.getElementById('content').innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3>Customers <span class="tag">${list.length}</span></h3>
        <input type="text" placeholder="Search customers…" value="${escape(state.search)}"
          oninput="state.search=this.value;renderCustomers()"
          style="width:220px;padding:6px 10px;border:0.5px solid var(--border-hover);border-radius:var(--radius);background:var(--bg);color:var(--text);font-size:13px;font-family:inherit;outline:none" />
      </div>
      <div class="card-body" style="overflow-x:auto">
        <table>
          <thead>
            <tr><th>Customer</th><th>Email</th><th>Phone</th><th>City</th><th>Orders</th><th>Total Spent</th><th></th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}

function openCustomerModal(id) {
  const c = id != null ? state.customers.find(x => x.id === id) : null;
  openModal(`
    <div class="modal">
      <div class="modal-header">
        <h3>${c ? 'Edit Customer' : 'Add Customer'}</h3>
        <button class="btn btn-sm" onclick="closeModal()"><i class="ti ti-x"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group">
            <label>Full Name *</label>
            <input id="c-name" value="${escape(c?.name || '')}" placeholder="e.g. Rahul Sharma" />
          </div>
          <div class="form-group">
            <label>City</label>
            <input id="c-city" value="${escape(c?.city || '')}" placeholder="Mumbai" />
          </div>
        </div>
        <div class="form-group">
          <label>Email *</label>
          <input id="c-email" type="email" value="${escape(c?.email || '')}" placeholder="rahul@example.com" />
        </div>
        <div class="form-group">
          <label>Phone</label>
          <input id="c-phone" value="${escape(c?.phone || '')}" placeholder="+91 98765 43210" />
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveCustomer(${id ?? 'null'})">${c ? 'Update' : 'Add Customer'}</button>
      </div>
    </div>`);
}

function saveCustomer(id) {
  const name  = document.getElementById('c-name').value.trim();
  const email = document.getElementById('c-email').value.trim();
  const phone = document.getElementById('c-phone').value.trim();
  const city  = document.getElementById('c-city').value.trim();

  if (!name || !email) { showToast('Name and email are required', 'danger'); return; }

  if (id != null) {
    const c = state.customers.find(x => x.id === id);
    Object.assign(c, { name, email, phone, city });
    showToast('Customer updated');
  } else {
    state.customers.push({ id: state.nextCustomerId++, name, email, phone, city, totalOrders: 0, totalSpent: 0 });
    showToast('Customer added');
  }
  persist(); closeModal(); renderCustomers();
}

function deleteCustomer(id) {
  if (!confirm('Delete this customer?')) return;
  state.customers = state.customers.filter(c => c.id !== id);
  persist(); showToast('Customer deleted', 'danger'); renderCustomers();
}

// ── Orders ─────────────────────────────────────────────────────────────────
function renderOrders() {
  const q = state.search.toLowerCase();
  const list = state.orders.filter(o => {
    const c = state.customers.find(x => x.id === o.customerId);
    return !q || o.id.toLowerCase().includes(q) ||
      c?.name.toLowerCase().includes(q) ||
      o.status.includes(q);
  });

  const rows = list.length
    ? list.slice().reverse().map(o => {
        const c = state.customers.find(x => x.id === o.customerId);
        return `<tr>
          <td style="font-weight:500">${escape(o.id)}</td>
          <td>
            <div style="display:flex;align-items:center;gap:8px">
              <div class="avatar" style="width:26px;height:26px;font-size:10px">
                ${c ? initials(c.name) : '?'}
              </div>
              ${c ? escape(c.name) : '<span style="color:var(--muted)">Unknown</span>'}
            </div>
          </td>
          <td style="color:var(--muted)">${o.items.length} item${o.items.length > 1 ? 's' : ''}</td>
          <td style="color:var(--muted)">${o.date}</td>
          <td style="font-weight:500">${fmt(o.total)}</td>
          <td><span class="badge badge-${STATUS_COLORS[o.status]}">${o.status}</span></td>
          <td>
            <div style="display:flex;gap:4px">
              <button class="btn btn-sm" onclick="updateOrderStatus('${o.id}')">
                <i class="ti ti-refresh"></i> Status
              </button>
              <button class="btn btn-sm btn-danger" onclick="deleteOrder('${o.id}')">
                <i class="ti ti-trash"></i>
              </button>
            </div>
          </td>
        </tr>`;
      }).join('')
    : `<tr><td colspan="7"><div class="empty-state"><i class="ti ti-shopping-cart-off"></i><p>No orders found</p></div></td></tr>`;

  document.getElementById('content').innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3>Orders <span class="tag">${list.length}</span></h3>
        <input type="text" placeholder="Search orders…" value="${escape(state.search)}"
          oninput="state.search=this.value;renderOrders()"
          style="width:220px;padding:6px 10px;border:0.5px solid var(--border-hover);border-radius:var(--radius);background:var(--bg);color:var(--text);font-size:13px;font-family:inherit;outline:none" />
      </div>
      <div class="card-body" style="overflow-x:auto">
        <table>
          <thead>
            <tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Date</th><th>Total</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}

function openOrderModal() {
  const customerOptions = state.customers.map(c =>
    `<option value="${c.id}">${escape(c.name)}</option>`
  ).join('');
  const productOptions = state.products.filter(p => p.qty > 0).map(p =>
    `<option value="${p.id}">${escape(p.name)} (${p.qty} in stock) — ${fmt(p.price)}</option>`
  ).join('');
  const today = new Date().toISOString().slice(0, 10);

  openModal(`
    <div class="modal">
      <div class="modal-header">
        <h3>New Order</h3>
        <button class="btn btn-sm" onclick="closeModal()"><i class="ti ti-x"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Customer *</label>
          <select id="o-cust"><option value="">Select customer…</option>${customerOptions}</select>
        </div>
        <div class="form-group">
          <label>Product *</label>
          <select id="o-prod"><option value="">Select product…</option>${productOptions}</select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Quantity *</label>
            <input id="o-qty" type="number" value="1" min="1" placeholder="1" />
          </div>
          <div class="form-group">
            <label>Order Date</label>
            <input id="o-date" type="date" value="${today}" />
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveOrder()">Create Order</button>
      </div>
    </div>`);
}

function saveOrder() {
  const custId = parseInt(document.getElementById('o-cust').value);
  const prodId = parseInt(document.getElementById('o-prod').value);
  const qty    = parseInt(document.getElementById('o-qty').value) || 1;
  const date   = document.getElementById('o-date').value;

  if (!custId || !prodId) { showToast('Select a customer and product', 'danger'); return; }
  const prod = state.products.find(p => p.id === prodId);
  if (qty > prod.qty) { showToast(`Only ${prod.qty} units in stock`, 'danger'); return; }

  const total = prod.price * qty;
  const id    = `ORD-${String(state.nextOrderId++).padStart(3, '0')}`;

  state.orders.push({ id, customerId: custId, items: [{ productId: prodId, qty, price: prod.price }], date, status: 'pending', total });
  prod.qty -= qty;

  const cust = state.customers.find(c => c.id === custId);
  cust.totalOrders++;
  cust.totalSpent += total;

  persist(); showToast('Order created'); closeModal(); renderOrders();
}

function updateOrderStatus(id) {
  const o = state.orders.find(x => x.id === id);
  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  openModal(`
    <div class="modal">
      <div class="modal-header">
        <h3>Update Status: ${escape(id)}</h3>
        <button class="btn btn-sm" onclick="closeModal()"><i class="ti ti-x"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Status</label>
          <select id="s-status">
            ${statuses.map(s => `<option value="${s}"${o.status === s ? ' selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="applyStatus('${id}')">Update</button>
      </div>
    </div>`);
}

function applyStatus(id) {
  state.orders.find(o => o.id === id).status = document.getElementById('s-status').value;
  persist(); showToast('Order status updated'); closeModal(); renderOrders();
}

function deleteOrder(id) {
  if (!confirm('Delete this order?')) return;
  state.orders = state.orders.filter(o => o.id !== id);
  persist(); showToast('Order deleted', 'danger'); renderOrders();
}

// ── Reports ────────────────────────────────────────────────────────────────
function renderReports() {
  const totalValue = state.products.reduce((a, p) => a + p.qty * p.price, 0);
  const totalCost  = state.products.reduce((a, p) => a + p.qty * p.cost, 0);
  const revenue    = state.orders.reduce((a, o) => a + o.total, 0);

  const summaryRows = (rows) => rows.map(([label, val, icon]) =>
    `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:0.5px solid var(--border)">
       <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--muted)">
         <i class="ti ${icon}"></i>${label}
       </div>
       <div style="font-size:13px;font-weight:500">${val}</div>
     </div>`
  ).join('');

  const topProducts  = [...state.products].sort((a, b) => b.qty * b.price - a.qty * a.price).slice(0, 5);
  const topCustomers = [...state.customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);

  document.getElementById('content').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div class="card">
        <div class="card-header"><h3>Inventory Summary</h3></div>
        <div class="card-body" style="padding:16px">
          ${summaryRows([
            ['Total SKUs', state.products.length, 'ti-package'],
            ['Total Units', state.products.reduce((a,p)=>a+p.qty,0), 'ti-stack'],
            ['Inventory Value (MRP)', fmt(totalValue), 'ti-currency-rupee'],
            ['Inventory Value (Cost)', fmt(totalCost), 'ti-currency-rupee'],
            ['Gross Margin Potential', fmt(totalValue - totalCost), 'ti-trending-up'],
            ['Low Stock Items', state.products.filter(p=>p.qty<=p.minQty&&p.qty>0).length, 'ti-alert-triangle'],
            ['Out of Stock', state.products.filter(p=>p.qty===0).length, 'ti-alert-circle'],
          ])}
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3>Order Summary</h3></div>
        <div class="card-body" style="padding:16px">
          ${summaryRows([
            ['Total Orders', state.orders.length, 'ti-shopping-cart'],
            ['Total Revenue', fmt(revenue), 'ti-currency-rupee'],
            ['Pending', state.orders.filter(o=>o.status==='pending').length, 'ti-clock'],
            ['Processing', state.orders.filter(o=>o.status==='processing').length, 'ti-refresh'],
            ['Shipped', state.orders.filter(o=>o.status==='shipped').length, 'ti-truck'],
            ['Delivered', state.orders.filter(o=>o.status==='delivered').length, 'ti-circle-check'],
            ['Total Customers', state.customers.length, 'ti-users'],
          ])}
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3>Top Products by Value</h3></div>
        <div class="card-body">
          <table>
            <thead><tr><th>Product</th><th>Qty</th><th>Value</th></tr></thead>
            <tbody>${topProducts.map(p =>
              `<tr>
                <td><div style="font-weight:500">${escape(p.name)}</div>
                    <div style="font-size:11px;color:var(--muted)">${escape(p.sku)}</div></td>
                <td>${p.qty}</td>
                <td style="font-weight:500">${fmt(p.qty * p.price)}</td>
               </tr>`
            ).join('')}</tbody>
          </table>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3>Top Customers by Spend</h3></div>
        <div class="card-body">
          <table>
            <thead><tr><th>Customer</th><th>Orders</th><th>Spent</th></tr></thead>
            <tbody>${topCustomers.map(c =>
              `<tr>
                <td><div style="display:flex;align-items:center;gap:8px">
                  <div class="avatar">${initials(c.name)}</div>
                  <span style="font-weight:500">${escape(c.name)}</span>
                </div></td>
                <td>${c.totalOrders}</td>
                <td style="font-weight:500">${fmt(c.totalSpent)}</td>
               </tr>`
            ).join('')}</tbody>
          </table>
        </div>
      </div>
    </div>`;
}

// ── Modal helpers ──────────────────────────────────────────────────────────
function openModal(html) {
  document.getElementById('modal-root').innerHTML =
    `<div class="modal-overlay" onclick="if(event.target===this)closeModal()">${html}</div>`;
}

function closeModal() {
  document.getElementById('modal-root').innerHTML = '';
}

// ── Boot ───────────────────────────────────────────────────────────────────
renderNav();
renderPage();
