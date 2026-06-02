// Initial seed data for StockPro Inventory Management

const INITIAL_DATA = {
  products: [
    { id: 1, name: 'Wireless Headphones', sku: 'WH-001', category: 'Electronics', qty: 45, minQty: 10, price: 2999, cost: 1800, supplier: 'TechCorp', location: 'A-01' },
    { id: 2, name: 'USB-C Cable 2m', sku: 'UC-002', category: 'Accessories', qty: 8, minQty: 20, price: 399, cost: 150, supplier: 'WireWorld', location: 'B-03' },
    { id: 3, name: 'Laptop Stand', sku: 'LS-003', category: 'Accessories', qty: 32, minQty: 5, price: 1499, cost: 700, supplier: 'DeskPro', location: 'A-05' },
    { id: 4, name: 'Mechanical Keyboard', sku: 'MK-004', category: 'Electronics', qty: 3, minQty: 8, price: 4999, cost: 2500, supplier: 'TechCorp', location: 'A-02' },
    { id: 5, name: 'Mouse Pad XL', sku: 'MP-005', category: 'Accessories', qty: 60, minQty: 15, price: 699, cost: 200, supplier: 'DeskPro', location: 'C-01' },
    { id: 6, name: 'Webcam HD', sku: 'WC-006', category: 'Electronics', qty: 12, minQty: 10, price: 3499, cost: 1900, supplier: 'VisionTech', location: 'A-03' },
    { id: 7, name: 'Desk Lamp LED', sku: 'DL-007', category: 'Furniture', qty: 0, minQty: 5, price: 1299, cost: 600, supplier: 'LightCo', location: 'D-01' },
  ],
  customers: [
    { id: 1, name: 'Rahul Sharma', email: 'rahul@example.com', phone: '+91 98765 43210', city: 'Mumbai', totalOrders: 5, totalSpent: 24995 },
    { id: 2, name: 'Priya Patel', email: 'priya@techfirm.in', phone: '+91 87654 32109', city: 'Bengaluru', totalOrders: 3, totalSpent: 12499 },
    { id: 3, name: 'Amit Kumar', email: 'amit@startup.io', phone: '+91 76543 21098', city: 'Delhi', totalOrders: 8, totalSpent: 49990 },
    { id: 4, name: 'Sneha Reddy', email: 'sneha@corp.com', phone: '+91 65432 10987', city: 'Hyderabad', totalOrders: 2, totalSpent: 7998 },
  ],
  orders: [
    { id: 'ORD-001', customerId: 1, items: [{productId: 1, qty: 2, price: 2999}], date: '2025-05-28', status: 'delivered', total: 5998 },
    { id: 'ORD-002', customerId: 3, items: [{productId: 4, qty: 1, price: 4999}, {productId: 2, qty: 3, price: 399}], date: '2025-05-30', status: 'shipped', total: 6196 },
    { id: 'ORD-003', customerId: 2, items: [{productId: 3, qty: 2, price: 1499}], date: '2025-06-01', status: 'processing', total: 2998 },
    { id: 'ORD-004', customerId: 4, items: [{productId: 6, qty: 1, price: 3499}], date: '2025-06-02', status: 'pending', total: 3499 },
  ],
};
