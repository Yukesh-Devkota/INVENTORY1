# StockPro – Inventory Management System

A fully functional, browser-based inventory management system. No server required — runs entirely in your browser.

## Features

- **Dashboard** – At-a-glance stats: inventory value, stock alerts, recent orders, category breakdown
- **Products** – Add / edit / delete products with SKU, category, supplier, pricing, stock levels, and location. Adjust stock with add/remove/set modes
- **Customers** – Manage customer records with contact details and order history
- **Orders** – Create orders (deducts stock automatically), update status, track revenue
- **Reports** – Inventory and order summary, top products by value, top customers by spend
- **Persistent storage** – All data saved in `localStorage` — survives page refresh
- **Search** – Live search on every list page
- **Dark mode** – Follows system preference automatically

## Getting Started

1. Open `index.html` in any modern browser (Chrome, Firefox, Safari, Edge)
2. No build step, no server, no dependencies to install
3. The Tabler Icons webfont loads from CDN (requires internet for icons; all logic works offline)

## File Structure

```
inventory-management/
├── index.html              # Entry point
├── README.md
└── src/
    ├── style.css           # All styles with CSS variables + dark mode
    ├── app.js              # Full application logic (state, rendering, CRUD)
    └── data/
        └── initialData.js  # Seed data loaded on first visit
```

## Usage Tips

- Click **Add Product** to create a new item; fill in Name, SKU, and Price (required)
- Use the **↕ Adjust** button to restock or write off inventory
- Create an **Order** from the Orders page — stock is deducted automatically
- Update order status through the **Status** button on each order row
- All changes persist via `localStorage` — clear browser storage to reset to seed data

## Tech Stack

- Vanilla HTML / CSS / JavaScript (no framework)
- Tabler Icons (CDN)
- `localStorage` for persistence
