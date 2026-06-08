import { useState, useRef, useEffect } from "react";

// ── Mock Data ──────────────────────────────────────────────────────────────────
const MOCK_ORDERS = [
  { id: "RM1717000001", customer: "Ravi Kumar", phone: "+91 98765 43210", items: 3, total: 1450, payment: "UPI", status: "Pending", date: "Today, 10:32 AM", address: "42, Gandhi Nagar, Rameswaram - 623526", itemsList: [{ name: "Ponni Rice", qty: "5 kg", price: 350 }, { name: "Toor Dal", qty: "1 kg", price: 150 }, { name: "Groundnut Oil", qty: "1 L", price: 200 }], delivery: 0 },
  { id: "RM1717000002", customer: "Meena Devi", phone: "+91 87654 32109", items: 2, total: 620, payment: "Cash on Delivery", status: "Accepted", date: "Today, 09:15 AM", address: "7, Sannathi Street, Rameswaram", itemsList: [{ name: "Basmati Rice", qty: "2 kg", price: 340 }, { name: "Chana Dal", qty: "1 kg", price: 130 }], delivery: 50 },
  { id: "RM1717000003", customer: "Suresh Babu", phone: "+91 76543 21098", items: 4, total: 2100, payment: "UPI", status: "Packed", date: "Today, 08:50 AM", address: "15, Beach Road, Pamban", itemsList: [{ name: "Sona Masoori Rice", qty: "10 kg", price: 750 }, { name: "Moong Dal", qty: "2 kg", price: 220 }, { name: "Sesame Oil", qty: "500 ml", price: 180 }, { name: "Red Chilli", qty: "250 g", price: 90 }], delivery: 0 },
  { id: "RM1717000004", customer: "Anitha S", phone: "+91 65432 10987", items: 1, total: 180, payment: "Bank Transfer", status: "Out for Delivery", date: "Yesterday", address: "3, Rajaji Road, Rameswaram", itemsList: [{ name: "Sunflower Oil", qty: "1 L", price: 180 }], delivery: 0 },
  { id: "RM1717000005", customer: "Murugan K", phone: "+91 54321 09876", items: 2, total: 890, payment: "UPI", status: "Delivered", date: "Yesterday", address: "21, Mosque Street, Rameswaram", itemsList: [{ name: "Red Rice", qty: "5 kg", price: 500 }, { name: "Urad Dal Whole", qty: "1 kg", price: 140 }], delivery: 50 },
  { id: "RM1717000006", customer: "Lakshmi R", phone: "+91 43210 98765", items: 1, total: 120, payment: "Cash on Delivery", status: "Cancelled", date: "2 days ago", address: "8, Annai Indira Nagar, Rameswaram", itemsList: [{ name: "Masoor Dal", qty: "1 kg", price: 120 }], delivery: 0 },
];

const ALL_PRODUCTS = [
  { id: 1, name: "Ponni Rice", tamil: "பொன்னி அரிசி", category: "Rice", icon: "🌾", price: 70, unit: "kg", stock: 150, available: true },
  { id: 2, name: "Sona Masoori Rice", tamil: "சோனா மசூரி", category: "Rice", icon: "🌾", price: 75, unit: "kg", stock: 8, available: true },
  { id: 3, name: "Basmati Rice", tamil: "பாசுமதி அரிசி", category: "Rice", icon: "🌾", price: 120, unit: "kg", stock: 60, available: true },
  { id: 4, name: "Idli Rice", tamil: "இட்லி அரிசி", category: "Rice", icon: "🌾", price: 55, unit: "kg", stock: 0, available: false },
  { id: 5, name: "Red Rice", tamil: "கைக்குத்தல் அரிசி", category: "Rice", icon: "🌾", price: 100, unit: "kg", stock: 40, available: true },
  { id: 6, name: "Toor Dal", tamil: "துவரம் பருப்பு", category: "Dal", icon: "🫘", price: 150, unit: "kg", stock: 80, available: true },
  { id: 7, name: "Moong Dal", tamil: "பாசிப் பருப்பு", category: "Dal", icon: "🫘", price: 110, unit: "kg", stock: 45, available: true },
  { id: 8, name: "Chana Dal", tamil: "கடலைப் பருப்பு", category: "Dal", icon: "🫘", price: 130, unit: "kg", stock: 55, available: true },
  { id: 9, name: "Masoor Dal", tamil: "மசூர் பருப்பு", category: "Dal", icon: "🫘", price: 120, unit: "kg", stock: 35, available: true },
  { id: 10, name: "Urad Dal Whole", tamil: "உழுந்து முழுசு", category: "Uzhundhu", icon: "🌑", price: 140, unit: "kg", stock: 12, available: true },
  { id: 11, name: "Urad Dal Split", tamil: "உழுந்து பருப்பு", category: "Uzhundhu", icon: "🌑", price: 145, unit: "kg", stock: 20, available: true },
  { id: 12, name: "Groundnut Oil", tamil: "கடலை எண்ணெய்", category: "Oil", icon: "🧴", price: 200, unit: "L", stock: 30, available: true },
  { id: 13, name: "Sesame Oil", tamil: "நல்லெண்ணெய்", category: "Oil", icon: "🧴", price: 350, unit: "L", stock: 15, available: true },
  { id: 14, name: "Coconut Oil", tamil: "தேங்காய் எண்ணெய்", category: "Oil", icon: "🧴", price: 220, unit: "L", stock: 25, available: true },
  { id: 15, name: "Sunflower Oil", tamil: "சூரியகாந்தி எண்ணெய்", category: "Oil", icon: "🧴", price: 180, unit: "L", stock: 40, available: true },
  { id: 16, name: "Red Chilli Powder", tamil: "மிளகாய் தூள்", category: "Spices", icon: "🌶️", price: 90, unit: "250g", stock: 60, available: true },
];

const MOCK_CATEGORIES = [
  { icon: "🌾", name: "Rice", tamil: "அரிசி", products: 5, active: true },
  { icon: "🫘", name: "Dal", tamil: "பருப்பு", products: 4, active: true },
  { icon: "🌑", name: "Uzhundhu", tamil: "உழுந்து", products: 3, active: true },
  { icon: "🧴", name: "Oil", tamil: "எண்ணெய்", products: 4, active: true },
  { icon: "🌶️", name: "Spices", tamil: "மசாலா", products: 6, active: true },
  { icon: "🛒", name: "Other Groceries", tamil: "மற்றவை", products: 8, active: false },
];

const MOCK_CUSTOMERS = [
  { id: 1, name: "Ravi Kumar", wa: "+91 98765 43210", orders: 12, spent: 8450, last: "Today", blocked: false },
  { id: 2, name: "Meena Devi", wa: "+91 87654 32109", orders: 7, spent: 4120, last: "Today", blocked: false },
  { id: 3, name: "Suresh Babu", wa: "+91 76543 21098", orders: 23, spent: 18700, last: "Today", blocked: false },
  { id: 4, name: "Anitha S", wa: "+91 65432 10987", orders: 3, spent: 1650, last: "Yesterday", blocked: false },
  { id: 5, name: "Murugan K", wa: "+91 54321 09876", orders: 18, spent: 13200, last: "Yesterday", blocked: false },
  { id: 6, name: "Spam User", wa: "+91 99999 00000", orders: 0, spent: 0, last: "3 days ago", blocked: true },
];

const MOCK_TOP_PRODUCTS = [
  { name: "Ponni Rice", revenue: 24500, qty: 350 },
  { name: "Toor Dal", revenue: 18200, qty: 121 },
  { name: "Sona Masoori Rice", revenue: 15800, qty: 210 },
  { name: "Groundnut Oil", revenue: 12400, qty: 62 },
  { name: "Basmati Rice", revenue: 9600, qty: 80 },
  { name: "Urad Dal Whole", revenue: 7840, qty: 56 },
  { name: "Moong Dal", revenue: 6600, qty: 60 },
  { name: "Idli Rice", revenue: 4400, qty: 80 },
];

const MOCK_CAT_SALES = [
  { name: "Rice 🌾", revenue: 54300, color: "#00d68f" },
  { name: "Dal 🫘", revenue: 32640, color: "#4a9eff" },
  { name: "Oil 🧴", revenue: 19800, color: "#a855f7" },
  { name: "Spices 🌶️", revenue: 11200, color: "#f5a623" },
  { name: "Uzhundhu 🌑", revenue: 8700, color: "#ff4757" },
];

// ── Styles ─────────────────────────────────────────────────────────────────────
const S = {
  page: { minHeight: "100vh", background: "#0f1117", fontFamily: "'Segoe UI', system-ui, sans-serif", display: "flex" },
  sidebar: (c) => ({ width: c ? 64 : 228, minHeight: "100vh", background: "#161b27", borderRight: "1.5px solid #2a3347", display: "flex", flexDirection: "column", transition: "width 0.22s ease", position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 100 }),
  main: (c) => ({ flex: 1, marginLeft: c ? 64 : 228, padding: 28, transition: "margin-left 0.22s", minHeight: "100vh" }),
  card: { background: "#161b27", border: "1.5px solid #2a3347", borderRadius: 16 },
  btn: (color = "#374159") => ({ padding: "7px 14px", border: `1.5px solid ${color}`, borderRadius: 8, background: "transparent", color, fontSize: 12, fontWeight: 700, cursor: "pointer" }),
  tag: (color) => ({ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${color}20`, color, border: `1px solid ${color}35`, whiteSpace: "nowrap" }),
  input: { padding: "9px 14px", background: "#1e2536", border: "1.5px solid #2a3347", borderRadius: 10, color: "#e8edf5", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" },
};

const STATUS_C = { "Pending": "#f5a623", "Accepted": "#4a9eff", "Packed": "#a855f7", "Out for Delivery": "#00b377", "Delivered": "#00d68f", "Cancelled": "#ff4757" };

const NAV = [
  { id: "dashboard", icon: "📊", label: "Dashboard" },
  { id: "orders", icon: "📋", label: "Orders" },
  { id: "products", icon: "📦", label: "Products" },
  { id: "categories", icon: "🗂️", label: "Categories" },
  { id: "customers", icon: "👥", label: "Customers" },
  { id: "reports", icon: "📈", label: "Reports" },
];

// ── Shared Components ──────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color = "#00d68f" }) {
  return (
    <div style={{ ...S.card, padding: "20px 22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontSize: 12, color: "#8b96b0", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</p>
          <h3 style={{ fontSize: 26, fontWeight: 800, color: "#e8edf5", letterSpacing: "-0.5px" }}>{value}</h3>
          {sub && <p style={{ fontSize: 12, color: "#5a6478", marginTop: 5 }}>{sub}</p>}
        </div>
        <div style={{ width: 44, height: 44, background: `${color}18`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{icon}</div>
      </div>
    </div>
  );
}

function Badge({ status }) {
  const c = STATUS_C[status] || "#8b96b0";
  return <span style={S.tag(c)}>{status}</span>;
}

// ── Pages ──────────────────────────────────────────────────────────────────────
function Dashboard({ setPage }) {
  return (
    <div>
      <div style={{ marginBottom: 26 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#e8edf5" }}>Dashboard</h1>
        <p style={{ color: "#5a6478", fontSize: 13, marginTop: 4 }}>Saturday, 06 June 2026</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard icon="💰" label="Today's Revenue" value="₹4,150" sub="6 orders today" color="#00d68f" />
        <StatCard icon="📦" label="Monthly Revenue" value="₹1,24,380" sub="+18% vs last month" color="#4a9eff" />
        <StatCard icon="⏳" label="Pending Orders" value="3" sub="Needs attention" color="#f5a623" />
        <StatCard icon="👥" label="Customers" value="142" sub="+12 this month" color="#a855f7" />
        <StatCard icon="🌾" label="Active Products" value="16" sub="2 low stock" color="#f5a623" />
      </div>
      <div style={S.card}>
        <div style={{ padding: "18px 22px", borderBottom: "1.5px solid #2a3347", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#e8edf5" }}>Recent Orders</h2>
          <button onClick={() => setPage("orders")} style={{ background: "none", border: "none", color: "#00d68f", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>View All →</button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #2a3347" }}>
                {["Order ID", "Customer", "Amount", "Payment", "Status", "Time"].map(h => (
                  <th key={h} style={{ padding: "11px 18px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#5a6478", letterSpacing: "0.5px", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_ORDERS.slice(0, 5).map(o => (
                <tr key={o.id} style={{ borderBottom: "1px solid #1e2536" }}>
                  <td style={{ padding: "13px 18px", fontFamily: "monospace", fontSize: 12, color: "#4a9eff", fontWeight: 600 }}>#{o.id}</td>
                  <td style={{ padding: "13px 18px", fontSize: 13, color: "#e8edf5" }}>{o.customer}</td>
                  <td style={{ padding: "13px 18px", fontSize: 13, fontWeight: 700, color: "#00d68f" }}>₹{o.total.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "13px 18px", fontSize: 12, color: "#8b96b0" }}>{o.payment}</td>
                  <td style={{ padding: "13px 18px" }}><Badge status={o.status} /></td>
                  <td style={{ padding: "13px 18px", fontSize: 12, color: "#5a6478" }}>{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Orders() {
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [orders, setOrders] = useState(MOCK_ORDERS);

  const filtered = statusFilter ? orders.filter(o => o.status === statusFilter) : orders;

  const updateStatus = (id, newStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    setSelected(prev => prev ? { ...prev, status: newStatus } : null);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#e8edf5" }}>Orders</h1>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...S.input, width: 180 }}>
          <option value="">All Statuses</option>
          {Object.keys(STATUS_C).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div style={S.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#1e2536", borderBottom: "1px solid #2a3347" }}>
                {["Order ID", "Customer", "Items", "Total", "Payment", "Status", "Date", ""].map(h => (
                  <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#5a6478", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} style={{ borderBottom: "1px solid #1e2536" }}>
                  <td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 12, color: "#4a9eff", fontWeight: 600 }}>#{o.id}</td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#e8edf5", fontWeight: 600 }}>{o.customer}</td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#8b96b0" }}>{o.items} items</td>
                  <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: "#00d68f" }}>₹{o.total.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: "#8b96b0" }}>{o.payment}</td>
                  <td style={{ padding: "12px 14px" }}><Badge status={o.status} /></td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: "#5a6478" }}>{o.date}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <button onClick={() => setSelected(o)} style={S.btn("#374159")}>Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setSelected(null)}>
          <div style={{ ...S.card, padding: 28, maxWidth: 540, width: "100%", maxHeight: "85vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: "#e8edf5" }}>Order #{selected.id}</h2>
                <div style={{ marginTop: 6 }}><Badge status={selected.status} /></div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "#5a6478", fontSize: 22, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              {[["Customer", selected.customer], ["Phone", selected.phone], ["Address", selected.address], ["Payment", selected.payment]].map(([k, v]) => (
                <div key={k} style={{ background: "#1e2536", borderRadius: 10, padding: "11px 14px" }}>
                  <div style={{ fontSize: 10, color: "#5a6478", fontWeight: 700, marginBottom: 4, textTransform: "uppercase" }}>{k}</div>
                  <div style={{ fontSize: 13, color: "#e8edf5" }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, color: "#5a6478", fontWeight: 700, marginBottom: 10, textTransform: "uppercase" }}>Items Ordered</p>
              {selected.itemsList.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #2a3347" }}>
                  <span style={{ fontSize: 13, color: "#e8edf5" }}>{item.name} × {item.qty}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#00d68f" }}>₹{item.price}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #2a3347" }}>
                <span style={{ fontSize: 13, color: "#8b96b0" }}>Delivery</span>
                <span style={{ fontSize: 13, color: selected.delivery === 0 ? "#00d68f" : "#e8edf5" }}>{selected.delivery === 0 ? "FREE" : `₹${selected.delivery}`}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0" }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: "#e8edf5" }}>Total</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: "#00d68f" }}>₹{selected.total.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <div>
              <p style={{ fontSize: 11, color: "#5a6478", fontWeight: 700, marginBottom: 10, textTransform: "uppercase" }}>Update Status</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["Accepted", "Packed", "Out for Delivery", "Delivered", "Cancelled"].map(s => (
                  <button key={s} onClick={() => updateStatus(selected.id, s)} style={{ padding: "8px 13px", borderRadius: 8, border: `1.5px solid ${STATUS_C[s]}40`, background: selected.status === s ? `${STATUS_C[s]}30` : `${STATUS_C[s]}12`, color: STATUS_C[s], fontSize: 12, fontWeight: 700, cursor: "pointer", outline: selected.status === s ? `2px solid ${STATUS_C[s]}` : "none" }}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Products() {
  const [products, setProducts] = useState(ALL_PRODUCTS);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", tamil: "", category: "Rice", price: "", unit: "kg", stock: "" });

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.tamil.includes(search));
  const toggle = (id) => setProducts(prev => prev.map(p => p.id === id ? { ...p, available: !p.available } : p));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#e8edf5" }}>Products</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <input placeholder="🔍 Search products..." style={{ ...S.input, width: 200 }} value={search} onChange={e => setSearch(e.target.value)} />
          <button onClick={() => setShowForm(true)} style={{ padding: "10px 18px", background: "linear-gradient(135deg,#00d68f,#00a86b)", border: "none", borderRadius: 10, color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>+ Add</button>
        </div>
      </div>
      <div style={S.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#1e2536", borderBottom: "1px solid #2a3347" }}>
                {["Name", "Tamil", "Category", "Price", "Stock", "Status", ""].map(h => (
                  <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#5a6478", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} style={{ borderBottom: "1px solid #1e2536", opacity: p.available ? 1 : 0.55 }}>
                  <td style={{ padding: "12px 14px", fontSize: 14, color: "#e8edf5", fontWeight: 600 }}>{p.icon} {p.name}</td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#8b96b0" }}>{p.tamil}</td>
                  <td style={{ padding: "12px 14px" }}><span style={S.tag("#4a9eff")}>{p.category}</span></td>
                  <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: "#00d68f" }}>₹{p.price}/{p.unit}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: p.stock === 0 ? "#ff4757" : p.stock < 10 ? "#f5a623" : "#e8edf5" }}>
                      {p.stock === 0 ? "Out of Stock" : `${p.stock} ${p.unit}`}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px" }}><span style={S.tag(p.available ? "#00d68f" : "#ff4757")}>{p.available ? "Active" : "Inactive"}</span></td>
                  <td style={{ padding: "12px 14px" }}>
                    <button onClick={() => toggle(p.id)} style={S.btn(p.available ? "#ff475780" : "#00d68f80")}>{p.available ? "Disable" : "Enable"}</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} style={{ padding: 30, textAlign: "center", color: "#5a6478" }}>No products found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setShowForm(false)}>
          <div style={{ ...S.card, padding: 28, maxWidth: 440, width: "100%" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: "#e8edf5" }}>Add Product</h2>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "#5a6478", fontSize: 22, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ display: "grid", gap: 13 }}>
              {[["Product Name (English)", "name", "text"], ["Product Name (Tamil)", "tamil", "text"], ["Price (₹)", "price", "number"], ["Stock Quantity", "stock", "number"]].map(([label, key, type]) => (
                <div key={key}>
                  <label style={{ display: "block", fontSize: 11, color: "#8b96b0", fontWeight: 700, marginBottom: 5, textTransform: "uppercase" }}>{label}</label>
                  <input type={type} style={S.input} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: 11, color: "#8b96b0", fontWeight: 700, marginBottom: 5, textTransform: "uppercase" }}>Category</label>
                <select style={S.input} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {MOCK_CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <button onClick={() => { if (!form.name || !form.price) return; setProducts(prev => [...prev, { ...form, id: Date.now(), price: +form.price, stock: +form.stock, icon: MOCK_CATEGORIES.find(c => c.name === form.category)?.icon || "📦", available: true }]); setShowForm(false); setForm({ name: "", tamil: "", category: "Rice", price: "", unit: "kg", stock: "" }); }} style={{ padding: "12px", background: "linear-gradient(135deg,#00d68f,#00a86b)", border: "none", borderRadius: 10, color: "#000", fontWeight: 700, fontSize: 14, cursor: "pointer", marginTop: 4 }}>
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Categories() {
  const [cats, setCats] = useState(MOCK_CATEGORIES);
  const toggle = (i) => setCats(prev => prev.map((c, idx) => idx === i ? { ...c, active: !c.active } : c));
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: "#e8edf5", marginBottom: 22 }}>Categories</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        {cats.map((cat, i) => (
          <div key={i} style={{ ...S.card, padding: 22, opacity: cat.active ? 1 : 0.55 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ width: 50, height: 50, background: "#1e2536", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 14 }}>{cat.icon}</div>
              <span style={S.tag(cat.active ? "#00d68f" : "#ff4757")}>{cat.active ? "Active" : "Inactive"}</span>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#e8edf5" }}>{cat.name}</h3>
            <p style={{ fontSize: 13, color: "#8b96b0", marginTop: 2 }}>{cat.tamil}</p>
            <p style={{ fontSize: 12, color: "#5a6478", marginTop: 4 }}>{cat.products} products</p>
            <button onClick={() => toggle(i)} style={{ marginTop: 14, width: "100%", padding: "9px", border: `1.5px solid ${cat.active ? "#ff475740" : "#00d68f40"}`, borderRadius: 10, background: cat.active ? "#ff475712" : "#00d68f12", color: cat.active ? "#ff4757" : "#00d68f", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              {cat.active ? "Disable" : "Enable"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Customers() {
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS);
  const toggle = (id) => setCustomers(prev => prev.map(c => c.id === id ? { ...c, blocked: !c.blocked } : c));
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: "#e8edf5", marginBottom: 22 }}>Customers</h1>
      <div style={S.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#1e2536", borderBottom: "1px solid #2a3347" }}>
                {["Name", "WhatsApp", "Orders", "Total Spent", "Last Active", "Status", "Action"].map(h => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#5a6478", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} style={{ borderBottom: "1px solid #1e2536" }}>
                  <td style={{ padding: "13px 16px", fontSize: 14, color: "#e8edf5", fontWeight: 600 }}>{c.name}</td>
                  <td style={{ padding: "13px 16px", fontFamily: "monospace", fontSize: 12, color: "#4a9eff" }}>{c.wa}</td>
                  <td style={{ padding: "13px 16px", fontSize: 14, fontWeight: 700, color: "#e8edf5" }}>{c.orders}</td>
                  <td style={{ padding: "13px 16px", fontSize: 13, fontWeight: 700, color: "#00d68f" }}>₹{c.spent.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "13px 16px", fontSize: 12, color: "#5a6478" }}>{c.last}</td>
                  <td style={{ padding: "13px 16px" }}><span style={S.tag(c.blocked ? "#ff4757" : "#00d68f")}>{c.blocked ? "Blocked" : "Active"}</span></td>
                  <td style={{ padding: "13px 16px" }}>
                    <button onClick={() => toggle(c.id)} style={S.btn(c.blocked ? "#00d68f80" : "#ff475780")}>{c.blocked ? "Unblock" : "Block"}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Reports() {
  const total = MOCK_CAT_SALES.reduce((s, c) => s + c.revenue, 0);
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: "#e8edf5", marginBottom: 22 }}>Reports & Analytics</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div style={{ ...S.card, padding: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#e8edf5", marginBottom: 20 }}>🏆 Top Products by Revenue</h2>
          {MOCK_TOP_PRODUCTS.map((p, i) => (
            <div key={p.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 7 ? "1px solid #1e2536" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 24, height: 24, background: i < 3 ? "#f5a62320" : "#2a3347", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: i < 3 ? "#f5a623" : "#5a6478" }}>{i + 1}</span>
                <span style={{ fontSize: 13, color: "#e8edf5" }}>{p.name}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#00d68f" }}>₹{p.revenue.toLocaleString("en-IN")}</div>
                <div style={{ fontSize: 11, color: "#5a6478" }}>{p.qty} sold</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ ...S.card, padding: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#e8edf5", marginBottom: 20 }}>📊 Sales by Category</h2>
          {MOCK_CAT_SALES.map(cat => {
            const pct = ((cat.revenue / total) * 100).toFixed(1);
            return (
              <div key={cat.name} style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: "#e8edf5", fontWeight: 600 }}>{cat.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: cat.color }}>₹{cat.revenue.toLocaleString("en-IN")} <span style={{ color: "#5a6478", fontWeight: 400 }}>({pct}%)</span></span>
                </div>
                <div style={{ height: 6, background: "#1e2536", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: cat.color, borderRadius: 3 }} />
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: 20, padding: "14px 16px", background: "#1e2536", borderRadius: 12 }}>
            <div style={{ fontSize: 12, color: "#8b96b0", marginBottom: 4 }}>Total Revenue</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#e8edf5" }}>₹{total.toLocaleString("en-IN")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── WhatsApp Bot ───────────────────────────────────────────────────────────────
const WA_BG = "linear-gradient(160deg,#0d1f18 0%,#0a1a14 100%)";
const WA_BUBBLE_BOT = "#1e2d24";
const WA_BUBBLE_USER = "#1a3a28";
const WA_GREEN = "#25D366";
const WA_ACCENT = "#00d68f";

// ── Language Strings ──────────────────────────────────────────────────────────
const LANG = {
  en: {
    headerSub: "Online • Rameswaram",
    reset: "Reset",
    cartItems: (n) => `${n} items`,
    shortcutSearch: "🔍 Search",
    shortcutRice: "🌾 Rice",
    shortcutCart: "🛒 Cart",
    searchPlaceholder: "Search: 'ponni' or 'rice'...",
    welcome: "🌾 *Rice Mandi* — Rameswaram\nWelcome to our shop! 🙏\n\nHow can we help you?",
    welcomeBtns: ["🛍️ Shop Now", "🔍 Search Product", "🛒 View Cart", "📦 My Orders"],
    categoriesMsg: "📦 *Categories*\nWhat would you like to buy?",
    categoriesHeader: "📦 CATEGORIES — Tap to select",
    productsHeader: "SELECT PRODUCT",
    productsMsg: (cat) => `${cat.icon} *${cat.name}*\nPlease select a product:`,
    searchPrompt: "🔍 *Search Product*\n\nType the product name:\n(English or Tamil)\n\nExample: 'ponni' or 'பொன்னி' or 'rice'",
    searchResultsMsg: (n) => `✅ *${n} products found!*\nPlease select:`,
    searchResultsHeader: (q) => `🔍 RESULTS — "${q}"`,
    searchAgain: "🔄 Search again",
    searchNoResult: (q) => `❌ *"${q}"* — No products found!\n\nPlease try another name.`,
    searchNoResultBtns: ["🔍 Try Again", "🛍️ Browse Categories"],
    productDetailMsg: (p) => `${p.icon} *${p.name}*\n${p.tamil}\n\n💰 Price: ₹${p.price}/${p.unit}\n📦 Stock: ${p.stock > 0 ? `${p.stock} ${p.unit}` : "⚠️ Low stock"}\n\nHow much do you need?`,
    itemAddedMsg: (p, qty, sub, total) => `✅ *Added to Cart!*\n\n${p.icon} ${p.name} × ${qty} ${p.unit}\nAmount: ₹${sub}\n\nCart Total: ₹${total}\nWant to add more?`,
    itemAddedBtns: ["🛍️ Continue Shopping", "🔍 Search Again", "🛒 View Cart"],
    cartEmptyMsg: "🛒 Your cart is empty!\nPlease add some products.",
    cartEmptyBtns: ["🛍️ Shop Now", "🔍 Search"],
    cartMsg: (items, freeDelivery, total) => `🛒 *Your Cart*\n\n${items}\n━━━━━━━━━━━━━\n🚚 Delivery: ${freeDelivery ? "FREE 🎉" : "₹50"}\n*Total: ₹${total}*`,
    cartClear: "🗑️ Clear",
    cartCheckout: "✅ Checkout",
    checkoutMsg: "📋 *Checkout Details*\nPlease fill in the form below:",
    checkoutSummaryTitle: "🛒 Order Summary",
    checkoutDeliveryLabel: "🚚 Delivery",
    checkoutFieldName: "👤 Your Name",
    checkoutFieldPhone: "📞 Phone Number",
    checkoutFieldAddress: "🏠 Delivery Address",
    checkoutFieldPayment: "💳 Payment Method",
    checkoutNamePlaceholder: "e.g. Ravi Kumar",
    checkoutPhonePlaceholder: "e.g. 9876543210",
    checkoutAddressPlaceholder: "Door No., Street, Area, City, Pincode",
    checkoutPaymentBtns: [["📱 UPI / QR", "UPI"], ["💵 Cash on Delivery", "COD"]],
    checkoutPlaceOrder: (total) => `🛒 Place Order — ₹${total}`,
    checkoutPlacing: "⏳ Placing Order...",
    checkoutBack: "← Back to Cart",
    checkoutErrName: "Please enter your name",
    checkoutErrPhone: "Enter valid 10-digit number",
    checkoutErrAddress: "Please enter full address",
    checkoutErrPayment: "Please select payment method",
    orderPlacedMsg: (id, items, total) => `🎉 *Order Confirmed!*\nOrder ID: #${id}\n\n${items}\n━━━━━━━━━━━━━\n*Total: ₹${total}*\n\nThank you! We will deliver soon. 🙏`,
    trackOrder: "📦 Track Order",
    myOrdersMsg: "📦 *Your Recent Orders*\n\n#RM17170001 — ₹1,450\nStatus: 🟡 Pending\n\n#RM17170002 — ₹890\nStatus: ✅ Delivered\n\n#RM17170003 — ₹2,100\nStatus: 📦 Packed",
    mainMenu: "🏠 Main Menu",
    langLabel: "EN",
    langSwitch: "தமிழ்",
  },
  ta: {
    headerSub: "ஆன்லைனில் • இராமேஸ்வரம்",
    reset: "மீட்டமை",
    cartItems: (n) => `${n} பொருட்கள்`,
    shortcutSearch: "🔍 தேடு",
    shortcutRice: "🌾 அரிசி",
    shortcutCart: "🛒 கார்ட்",
    searchPlaceholder: "தேடு: 'ponni' அல்லது 'பொன்னி'...",
    welcome: "🌾 *ரைஸ் மண்டி* — இராமேஸ்வரம்\nநம் கடைக்கு வந்ததற்கு நன்றி! 🙏\n\nஎன்னை செலக்ட் பண்ணுங்க:",
    welcomeBtns: ["🛍️ கடை பார்க்க", "🔍 பொருள் தேட", "🛒 கார்ட் பார்க்க", "📦 என் ஆர்டர்கள்"],
    categoriesMsg: "📦 *வகைகள்*\nஎதை வாங்க விரும்புகிறீர்கள்?",
    categoriesHeader: "📦 வகைகள் — தட்டவும்",
    productsHeader: "பொருள் தேர்ந்தெடுக்கவும்",
    productsMsg: (cat) => `${cat.icon} *${cat.name}*\nபொருள் செலக்ட் பண்ணுங்க:`,
    searchPrompt: "🔍 *பொருள் தேடு*\n\nபொருளின் பெயர் டைப் பண்ணுங்க:\n(English or Tamil)\n\nExample: 'ponni' or 'பொன்னி'",
    searchResultsMsg: (n) => `✅ *${n} பொருட்கள் கிடைத்தன!*\nதேர்ந்தெடுக்கவும்:`,
    searchResultsHeader: (q) => `🔍 தேடல் முடிவு — "${q}"`,
    searchAgain: "🔄 மீண்டும் தேடு",
    searchNoResult: (q) => `❌ *"${q}"* — பொருள் கிடைக்கவில்லை!\n\nவேறு பெயர் try பண்ணுங்க.`,
    searchNoResultBtns: ["🔍 மீண்டும் தேட", "🛍️ வகைகள் பார்க்க"],
    productDetailMsg: (p) => `${p.icon} *${p.name}*\n${p.tamil}\n\n💰 விலை: ₹${p.price}/${p.unit}\n📦 இருப்பு: ${p.stock > 0 ? `${p.stock} ${p.unit}` : "⚠️ குறைவாக உள்ளது"}\n\nஎவ்வளவு வேண்டும்?`,
    itemAddedMsg: (p, qty, sub, total) => `✅ *கார்ட்-ல் சேர்த்தோம்!*\n\n${p.icon} ${p.name} × ${qty} ${p.unit}\nதொகை: ₹${sub}\n\nகார்ட் மொத்தம்: ₹${total}\nமேலும் வேண்டுமா?`,
    itemAddedBtns: ["🛍️ தொடர்ந்து வாங்க", "🔍 மீண்டும் தேட", "🛒 கார்ட் பார்க்க"],
    cartEmptyMsg: "🛒 உங்கள் கார்ட் காலியாக உள்ளது!\nபொருட்கள் சேர்க்கவும்.",
    cartEmptyBtns: ["🛍️ கடை பார்க்க", "🔍 தேடு"],
    cartMsg: (items, freeDelivery, total) => `🛒 *உங்கள் கார்ட்*\n\n${items}\n━━━━━━━━━━━━━\n🚚 டெலிவரி: ${freeDelivery ? "இலவசம் 🎉" : "₹50"}\n*மொத்தம்: ₹${total}*`,
    cartClear: "🗑️ அழி",
    cartCheckout: "✅ ஆர்டர் செய்",
    checkoutMsg: "📋 *ஆர்டர் விவரங்கள்*\nகீழே உள்ள form fill பண்ணுங்க:",
    checkoutSummaryTitle: "🛒 ஆர்டர் சுருக்கம்",
    checkoutDeliveryLabel: "🚚 டெலிவரி",
    checkoutFieldName: "👤 உங்கள் பெயர்",
    checkoutFieldPhone: "📞 தொலைபேசி எண்",
    checkoutFieldAddress: "🏠 டெலிவரி முகவரி",
    checkoutFieldPayment: "💳 பணம் செலுத்தும் முறை",
    checkoutNamePlaceholder: "உ.தா. ரவி குமார்",
    checkoutPhonePlaceholder: "உ.தா. 9876543210",
    checkoutAddressPlaceholder: "கதவு எண், தெரு, ஊர், பின்கோடு",
    checkoutPaymentBtns: [["📱 UPI / QR", "UPI"], ["💵 நேரில் பணம்", "COD"]],
    checkoutPlaceOrder: (total) => `🛒 ஆர்டர் செய் — ₹${total}`,
    checkoutPlacing: "⏳ ஆர்டர் செய்கிறோம்...",
    checkoutBack: "← கார்ட்டிற்கு திரும்பு",
    checkoutErrName: "பெயர் சொல்லுங்க",
    checkoutErrPhone: "சரியான 10 இலக்க எண் சொல்லுங்க",
    checkoutErrAddress: "முழு முகவரி சொல்லுங்க",
    checkoutErrPayment: "பணம் செலுத்தும் முறை தேர்ந்தெடுங்க",
    orderPlacedMsg: (id, items, total) => `🎉 *ஆர்டர் உறுதிப்படுத்தப்பட்டது!*\nஆர்டர் ID: #${id}\n\n${items}\n━━━━━━━━━━━━━\n*மொத்தம்: ₹${total}*\n\nநன்றி! உங்கள் ஆர்டரை விரைவில் டெலிவரி செய்வோம். 🙏`,
    trackOrder: "📦 ஆர்டர் கண்காணி",
    myOrdersMsg: "📦 *உங்கள் சமீபத்திய ஆர்டர்கள்*\n\n#RM17170001 — ₹1,450\nநிலை: 🟡 நிலுவையில்\n\n#RM17170002 — ₹890\nநிலை: ✅ டெலிவரி ஆனது\n\n#RM17170003 — ₹2,100\nநிலை: 📦 பேக் செய்யப்பட்டது",
    mainMenu: "🏠 முதல் பக்கம்",
    langLabel: "தமிழ்",
    langSwitch: "EN",
  }
};

function WaText({ text }) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return (
    <span style={{ fontSize: 13, color: "#e8edf5", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
      {parts.map((p, i) =>
        p.startsWith("*") && p.endsWith("*")
          ? <strong key={i} style={{ color: "#fff" }}>{p.slice(1, -1)}</strong>
          : p
      )}
    </span>
  );
}

function BotPreview() {
  const scrollRef = useRef(null);

  // Language
  const [lang, setLang] = useState("en");
  const t = LANG[lang];

  // Cart state
  const [cart, setCart] = useState([]);

  // Conversation state
  const [messages, setMessages] = useState([]);
  const [screen, setScreen] = useState("welcome");
  const [inputVal, setInputVal] = useState("");

  // Search-specific state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Single-page checkout form state
  const [checkoutForm, setCheckoutForm] = useState({ name: "", phone: "", address: "", payment: "" });
  const [checkoutErrors, setCheckoutErrors] = useState({});
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);

  // Init
  useEffect(() => {
    setMessages([{ from: "bot", type: "welcome" }]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const cartTotal = cart.reduce((s, i) => s + i.subtotal, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const pushUser = (text) => setMessages(prev => [...prev, { from: "user", text }]);
  const pushBot = (type, data = {}) => setMessages(prev => [...prev, { from: "bot", type, ...data }]);

  const go = (userText, nextScreen, botType, botData = {}) => {
    pushUser(userText);
    setTimeout(() => { pushBot(botType, botData); setScreen(nextScreen); }, 300);
  };

  const addToCart = (product, qty) => {
    const subtotal = product.price * qty;
    setCart(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty, subtotal: i.subtotal + subtotal } : i);
      return [...prev, { ...product, qty, subtotal }];
    });
    return subtotal;
  };

  const handleSearch = (q) => {
    const query = q.trim().toLowerCase();
    if (!query) return;
    const results = ALL_PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.tamil.includes(query) ||
      p.category.toLowerCase().includes(query)
    ).slice(0, 5);
    setSearchResults(results);
    pushUser(q);
    setTimeout(() => {
      if (results.length === 0) {
        pushBot("search_no_result", { query: q });
        setScreen("search_input");
      } else {
        pushBot("search_results", { results, query: q });
        setScreen("search_results");
      }
    }, 300);
    setInputVal("");
  };

  const handleSelectSearchProduct = (product) => {
    setSelectedProduct(product);
    pushUser(product.name);
    setTimeout(() => { pushBot("product_detail", { product }); setScreen("search_quantity"); }, 300);
  };

  const handleSearchQty = (qty) => {
    const sub = addToCart(selectedProduct, qty);
    pushUser(`${qty} ${selectedProduct.unit}`);
    setTimeout(() => { pushBot("item_added", { product: selectedProduct, qty, sub }); setScreen("after_add"); }, 300);
  };

  // Screens
  const renderBotMessage = (msg, isLast) => {
    const { type } = msg;

    const BubbleWrap = ({ children, actions }) => (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", maxWidth: "88%" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginBottom: actions ? 8 : 0 }}>
          <div style={{ width: 28, height: 28, background: WA_GREEN, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🌾</div>
          <div style={{ background: WA_BUBBLE_BOT, borderRadius: "14px 14px 14px 4px", padding: "10px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
            {children}
            <div style={{ fontSize: 10, color: "#5a6478", marginTop: 6, textAlign: "right" }}>
              {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </div>
        {isLast && actions}
      </div>
    );

    if (type === "welcome") return (
      <BubbleWrap actions={
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, paddingLeft: 34 }}>
          {t.welcomeBtns.map((label, idx) => {
            const nexts = ["categories", "search_input", "cart", "my_orders"];
            const bots  = ["categories", "search_prompt", cartCount > 0 ? "cart_view" : "cart_empty", "my_orders"];
            return <button key={label} onClick={() => go(label, nexts[idx], bots[idx])} style={{ padding: "7px 14px", background: "#0d2a1a", border: `1.5px solid ${WA_ACCENT}50`, borderRadius: 20, color: WA_ACCENT, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{label}</button>;
          })}
        </div>
      }>
        <WaText text={t.welcome} />
      </BubbleWrap>
    );

    if (type === "categories") return (
      <BubbleWrap actions={
        <div style={{ background: WA_BUBBLE_BOT, borderRadius: 12, overflow: "hidden", border: "1px solid #2a4a38", marginLeft: 34 }}>
          <div style={{ padding: "8px 14px", borderBottom: "1px solid #2a4a38", fontSize: 11, color: "#8b96b0", fontWeight: 700 }}>{t.categoriesHeader}</div>
          {MOCK_CATEGORIES.filter(c => c.active).map((cat, j) => (
            <button key={j} onClick={() => go(`${cat.icon} ${cat.name}`, "products", "products", { cat })} style={{ width: "100%", padding: "11px 14px", background: "transparent", border: "none", borderBottom: j < 4 ? "1px solid #2a4a38" : "none", color: "#e8edf5", fontSize: 13, textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{cat.icon} {cat.name} <span style={{ color: "#5a6478", fontSize: 11 }}>({cat.tamil})</span></span>
              <span style={{ color: "#5a6478", fontSize: 11 }}>{cat.products} items ›</span>
            </button>
          ))}
        </div>
      }>
        <WaText text={t.categoriesMsg} />
      </BubbleWrap>
    );

    if (type === "products") {
      const catProducts = ALL_PRODUCTS.filter(p => p.category === (msg.cat?.name || "Rice") && p.available).slice(0, 5);
      return (
        <BubbleWrap actions={
          <div style={{ background: WA_BUBBLE_BOT, borderRadius: 12, overflow: "hidden", border: "1px solid #2a4a38", marginLeft: 34 }}>
            <div style={{ padding: "8px 14px", borderBottom: "1px solid #2a4a38", fontSize: 11, color: "#8b96b0", fontWeight: 700 }}>{t.productsHeader}</div>
            {catProducts.map((p, j) => (
              <button key={j} onClick={() => { setSelectedProduct(p); go(p.name, "search_quantity", "product_detail", { product: p }); }} style={{ width: "100%", padding: "11px 14px", background: "transparent", border: "none", borderBottom: j < catProducts.length - 1 ? "1px solid #2a4a38" : "none", color: "#e8edf5", fontSize: 13, textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between" }}>
                <span>{p.icon} {p.name}</span>
                <span style={{ color: WA_ACCENT, fontWeight: 700 }}>₹{p.price}/{p.unit}</span>
              </button>
            ))}
          </div>
        }>
          <WaText text={t.productsMsg(msg.cat || { icon: "🌾", name: "Rice" })} />
        </BubbleWrap>
      );
    }

    if (type === "search_prompt") return (
      <BubbleWrap><WaText text={t.searchPrompt} /></BubbleWrap>
    );

    if (type === "search_results") return (
      <BubbleWrap actions={
        <div style={{ background: WA_BUBBLE_BOT, borderRadius: 12, overflow: "hidden", border: "1px solid #2a4a38", marginLeft: 34 }}>
          <div style={{ padding: "8px 14px", borderBottom: "1px solid #2a4a38", fontSize: 11, color: "#8b96b0", fontWeight: 700 }}>{t.searchResultsHeader(msg.query)}</div>
          {msg.results.map((p, j) => (
            <button key={j} onClick={() => handleSelectSearchProduct(p)} style={{ width: "100%", padding: "11px 14px", background: "transparent", border: "none", borderBottom: j < msg.results.length - 1 ? "1px solid #2a4a38" : "none", color: "#e8edf5", fontSize: 13, textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600 }}>{p.icon} {p.name}</div>
                <div style={{ fontSize: 11, color: "#8b96b0", marginTop: 2 }}>{p.tamil} • {p.category}</div>
              </div>
              <span style={{ color: WA_ACCENT, fontWeight: 700, fontSize: 14 }}>₹{p.price}/{p.unit}</span>
            </button>
          ))}
          <button onClick={() => go(t.searchAgain, "search_input", "search_prompt")} style={{ width: "100%", padding: "10px 14px", background: "transparent", border: "none", color: "#5a6478", fontSize: 12, textAlign: "left", cursor: "pointer" }}>{t.searchAgain}</button>
        </div>
      }>
        <WaText text={t.searchResultsMsg(msg.results.length)} />
      </BubbleWrap>
    );

    if (type === "search_no_result") return (
      <BubbleWrap actions={
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, paddingLeft: 34 }}>
          {t.searchNoResultBtns.map((b, idx) => (
            <button key={b} onClick={() => go(b, idx === 0 ? "search_input" : "categories", idx === 0 ? "search_prompt" : "categories")} style={{ padding: "7px 14px", background: "#0d2a1a", border: `1.5px solid ${WA_ACCENT}50`, borderRadius: 20, color: WA_ACCENT, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{b}</button>
          ))}
        </div>
      }>
        <WaText text={t.searchNoResult(msg.query)} />
      </BubbleWrap>
    );

    if (type === "product_detail") {
      const p = msg.product;
      return (
        <BubbleWrap actions={
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, paddingLeft: 34 }}>
            {[1, 2, 5, 10].map(qty => (
              <button key={qty} onClick={() => handleSearchQty(qty)} style={{ padding: "8px 16px", background: "#0d2a1a", border: `1.5px solid ${WA_ACCENT}50`, borderRadius: 20, color: WA_ACCENT, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{qty} {p.unit}</button>
            ))}
          </div>
        }>
          <WaText text={t.productDetailMsg(p)} />
        </BubbleWrap>
      );
    }

    if (type === "item_added") {
      const p = msg.product;
      const newTotal = cartTotal + msg.sub;
      return (
        <BubbleWrap actions={
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, paddingLeft: 34 }}>
            {t.itemAddedBtns.map((label, idx) => {
              const nexts = ["categories", "search_input", "cart"];
              const bots  = ["categories", "search_prompt", "cart_view"];
              return <button key={label} onClick={() => go(label, nexts[idx], bots[idx])} style={{ padding: "7px 13px", background: "#0d2a1a", border: `1.5px solid ${WA_ACCENT}50`, borderRadius: 20, color: WA_ACCENT, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{label}</button>;
            })}
          </div>
        }>
          <WaText text={t.itemAddedMsg(p, msg.qty, msg.sub, newTotal)} />
        </BubbleWrap>
      );
    }

    if (type === "cart_view" || type === "cart_empty") {
      if (cart.length === 0) return (
        <BubbleWrap actions={
          <div style={{ display: "flex", gap: 7, paddingLeft: 34 }}>
            {t.cartEmptyBtns.map((label, idx) => (
              <button key={label} onClick={() => go(label, idx === 0 ? "categories" : "search_input", idx === 0 ? "categories" : "search_prompt")} style={{ padding: "7px 14px", background: "#0d2a1a", border: `1.5px solid ${WA_ACCENT}50`, borderRadius: 20, color: WA_ACCENT, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{label}</button>
            ))}
          </div>
        }>
          <WaText text={t.cartEmptyMsg} />
        </BubbleWrap>
      );
      const freeDelivery = cartTotal >= 1000;
      const items = cart.map(i => `• ${i.icon} ${i.name} × ${i.qty} ${i.unit} — ₹${i.subtotal}`).join("\n");
      return (
        <BubbleWrap actions={
          <div style={{ display: "flex", gap: 7, paddingLeft: 34 }}>
            <button onClick={() => go(t.cartCheckout, "checkout_form", "checkout_form")} style={{ padding: "8px 16px", background: `linear-gradient(135deg,${WA_GREEN},#00a86b)`, border: "none", borderRadius: 20, color: "#000", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>{t.cartCheckout}</button>
            <button onClick={() => { setCart([]); go(t.cartClear, "welcome", "welcome"); }} style={{ padding: "8px 14px", background: "transparent", border: `1.5px solid #ff475760`, borderRadius: 20, color: "#ff4757", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{t.cartClear}</button>
          </div>
        }>
          <WaText text={t.cartMsg(items, freeDelivery, cartTotal + (freeDelivery ? 0 : 50))} />
        </BubbleWrap>
      );
    }

    if (type === "checkout_form") {
      const freeDelivery = cartTotal >= 1000;
      const deliveryFee = freeDelivery ? 0 : 50;
      const finalTotal = cartTotal + deliveryFee;

      const validate = () => {
        const errs = {};
        if (!checkoutForm.name.trim()) errs.name = t.checkoutErrName;
        if (!/^\d{10}$/.test(checkoutForm.phone.replace(/\s/g, ""))) errs.phone = t.checkoutErrPhone;
        if (!checkoutForm.address.trim() || checkoutForm.address.trim().length < 10) errs.address = t.checkoutErrAddress;
        if (!checkoutForm.payment) errs.payment = t.checkoutErrPayment;
        return errs;
      };

      const handlePlaceOrder = () => {
        const errs = validate();
        setCheckoutErrors(errs);
        if (Object.keys(errs).length > 0) return;
        setCheckoutSubmitting(true);
        setTimeout(() => {
          setCheckoutSubmitting(false);
          pushUser(`✅ ${checkoutForm.name}, ${checkoutForm.payment}`);
          setTimeout(() => { pushBot("order_placed"); setScreen("order_placed"); setCart([]); setCheckoutForm({ name: "", phone: "", address: "", payment: "" }); }, 300);
        }, 900);
      };

      const field = (key, label, placeholder, type = "text") => (
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontSize: 11, color: "#8b96b0", fontWeight: 700, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px" }}>{label}</label>
          <input
            type={type}
            placeholder={placeholder}
            value={checkoutForm[key]}
            onChange={e => { setCheckoutForm(f => ({ ...f, [key]: e.target.value })); setCheckoutErrors(er => ({ ...er, [key]: "" })); }}
            style={{ width: "100%", padding: "9px 12px", background: "#0d2216", border: `1.5px solid ${checkoutErrors[key] ? "#ff4757" : "#1a4a2e"}`, borderRadius: 10, color: "#e8edf5", fontSize: 13, outline: "none", boxSizing: "border-box" }}
          />
          {checkoutErrors[key] && <div style={{ fontSize: 11, color: "#ff4757", marginTop: 4 }}>⚠ {checkoutErrors[key]}</div>}
        </div>
      );

      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", maxWidth: "94%" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginBottom: 8 }}>
            <div style={{ width: 28, height: 28, background: WA_GREEN, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🌾</div>
            <div style={{ background: WA_BUBBLE_BOT, borderRadius: "14px 14px 14px 4px", padding: "10px 14px" }}>
              <WaText text={t.checkoutMsg} />
              <div style={{ fontSize: 10, color: "#5a6478", marginTop: 6, textAlign: "right" }}>{new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
            </div>
          </div>

          {isLast && (
            <div style={{ marginLeft: 34, width: "calc(100% - 34px)", background: "#0f2a1c", border: "1.5px solid #1a4a2e", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ background: "#1a3a28", padding: "12px 16px", borderBottom: "1px solid #1a4a2e", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#e8edf5" }}>{t.checkoutSummaryTitle}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: WA_ACCENT }}>₹{finalTotal}</div>
              </div>
              <div style={{ padding: "10px 14px", borderBottom: "1px solid #1a4a2e" }}>
                {(cart.length > 0 ? cart : [{ icon: "🌾", name: "Ponni Rice", qty: 5, unit: "kg", subtotal: 350 }]).map((item, j) => (
                  <div key={j} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#8b96b0", marginBottom: 4 }}>
                    <span>{item.icon} {item.name} × {item.qty}{item.unit}</span>
                    <span style={{ color: WA_ACCENT }}>₹{item.subtotal}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#5a6478", marginTop: 6, paddingTop: 6, borderTop: "1px solid #1a4a2e" }}>
                  <span>{t.checkoutDeliveryLabel}</span>
                  <span style={{ color: freeDelivery ? WA_ACCENT : "#e8edf5" }}>{freeDelivery ? (lang === "ta" ? "இலவசம் 🎉" : "FREE 🎉") : "₹50"}</span>
                </div>
              </div>
              <div style={{ padding: "14px 16px" }}>
                {field("name", t.checkoutFieldName, t.checkoutNamePlaceholder)}
                {field("phone", t.checkoutFieldPhone, t.checkoutPhonePlaceholder, "tel")}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 11, color: "#8b96b0", fontWeight: 700, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px" }}>{t.checkoutFieldAddress}</label>
                  <textarea placeholder={t.checkoutAddressPlaceholder} value={checkoutForm.address} onChange={e => { setCheckoutForm(f => ({ ...f, address: e.target.value })); setCheckoutErrors(er => ({ ...er, address: "" })); }} rows={3} style={{ width: "100%", padding: "9px 12px", background: "#0d2216", border: `1.5px solid ${checkoutErrors.address ? "#ff4757" : "#1a4a2e"}`, borderRadius: 10, color: "#e8edf5", fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
                  {checkoutErrors.address && <div style={{ fontSize: 11, color: "#ff4757", marginTop: 4 }}>⚠ {checkoutErrors.address}</div>}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 11, color: "#8b96b0", fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.4px" }}>{t.checkoutFieldPayment}</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {t.checkoutPaymentBtns.map(([label, val]) => (
                      <button key={val} onClick={() => { setCheckoutForm(f => ({ ...f, payment: val })); setCheckoutErrors(er => ({ ...er, payment: "" })); }} style={{ flex: 1, padding: "10px 8px", background: checkoutForm.payment === val ? `${WA_ACCENT}20` : "#0d2216", border: `1.5px solid ${checkoutForm.payment === val ? WA_ACCENT : "#1a4a2e"}`, borderRadius: 10, color: checkoutForm.payment === val ? WA_ACCENT : "#8b96b0", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}>
                        {label}
                      </button>
                    ))}
                  </div>
                  {checkoutErrors.payment && <div style={{ fontSize: 11, color: "#ff4757", marginTop: 4 }}>⚠ {checkoutErrors.payment}</div>}
                </div>
                <button onClick={handlePlaceOrder} disabled={checkoutSubmitting} style={{ width: "100%", padding: "13px", background: checkoutSubmitting ? "#1a4a2e" : `linear-gradient(135deg,${WA_GREEN},#00a86b)`, border: "none", borderRadius: 12, color: checkoutSubmitting ? "#5a6478" : "#000", fontWeight: 800, fontSize: 14, cursor: checkoutSubmitting ? "default" : "pointer", transition: "all 0.2s" }}>
                  {checkoutSubmitting ? t.checkoutPlacing : t.checkoutPlaceOrder(finalTotal)}
                </button>
                <button onClick={() => go(t.checkoutBack, "cart", "cart_view")} style={{ width: "100%", padding: "8px", marginTop: 8, background: "transparent", border: "none", color: "#5a6478", fontSize: 12, cursor: "pointer" }}>
                  {t.checkoutBack}
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (type === "order_placed") {
      const orderId = `RM${Date.now().toString().slice(-8)}`;
      const items = cart.length > 0 ? cart.map(i => `• ${i.name} × ${i.qty} ${i.unit}`).join("\n") : "• Ponni Rice × 5 kg\n• Toor Dal × 1 kg";
      return (
        <BubbleWrap actions={
          <button onClick={() => go(t.trackOrder, "my_orders", "my_orders")} style={{ marginLeft: 34, padding: "8px 18px", background: `linear-gradient(135deg,${WA_GREEN},#00a86b)`, border: "none", borderRadius: 20, color: "#000", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>{t.trackOrder}</button>
        }>
          <WaText text={t.orderPlacedMsg(orderId, items, cartTotal > 0 ? cartTotal : 500)} />
        </BubbleWrap>
      );
    }

    if (type === "my_orders") return (
      <BubbleWrap actions={
        <button onClick={() => go(t.mainMenu, "welcome", "welcome")} style={{ marginLeft: 34, padding: "7px 14px", background: "#0d2a1a", border: `1.5px solid ${WA_ACCENT}50`, borderRadius: 20, color: WA_ACCENT, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{t.mainMenu}</button>
      }>
        <WaText text={t.myOrdersMsg} />
      </BubbleWrap>
    );

    return null;
  };

  const isInputScreen = screen === "search_input";

  const handleInput = () => {
    if (!inputVal.trim()) return;
    if (screen === "search_input") { handleSearch(inputVal); return; }
    setInputVal("");
  };

  const reset = () => { setMessages([{ from: "bot", type: "welcome" }]); setScreen("welcome"); setCart([]); setInputVal(""); setSearchQuery(""); setSearchResults([]); setSelectedProduct(null); setCheckoutForm({ name: "", phone: "", address: "", payment: "" }); setCheckoutErrors({}); };

  const switchLang = () => {
    const newLang = lang === "en" ? "ta" : "en";
    setLang(newLang);
    setMessages([{ from: "bot", type: "welcome" }]);
    setScreen("welcome");
    setCart([]);
    setInputVal("");
    setCheckoutForm({ name: "", phone: "", address: "", payment: "" });
    setCheckoutErrors({});
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: WA_BG, borderRadius: 20, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ background: "#0d2a1a", padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #1a3a28" }}>
        <div style={{ width: 36, height: 36, background: WA_GREEN, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>🌾</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#e8edf5" }}>Rice Mandi Bot</div>
          <div style={{ fontSize: 11, color: WA_GREEN }}>● {t.headerSub}</div>
        </div>
        {cartCount > 0 && (
          <div style={{ background: "#1a3a28", border: `1px solid ${WA_ACCENT}40`, borderRadius: 20, padding: "4px 10px", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12 }}>🛒</span>
            <span style={{ fontSize: 12, color: WA_ACCENT, fontWeight: 700 }}>{t.cartItems(cartCount)}</span>
          </div>
        )}
        {/* Language Toggle */}
        <button onClick={switchLang} style={{ padding: "5px 11px", background: "#1a3a28", border: `1.5px solid ${WA_ACCENT}50`, borderRadius: 20, color: WA_ACCENT, fontSize: 11, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 13 }}>🌐</span> {t.langSwitch}
        </button>
        <button onClick={reset} style={{ padding: "5px 10px", background: "#1a3a28", border: `1px solid ${WA_ACCENT}30`, borderRadius: 8, color: "#8b96b0", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{t.reset}</button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "14px 12px", display: "flex", flexDirection: "column", gap: 14 }}>
        {messages.map((msg, i) => {
          const isLast = i === messages.length - 1;
          if (msg.from === "user") return (
            <div key={i} style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ background: WA_BUBBLE_USER, borderRadius: "14px 14px 4px 14px", padding: "9px 13px", maxWidth: "75%", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
                <span style={{ fontSize: 13, color: "#e8edf5" }}>{msg.text}</span>
                <div style={{ fontSize: 10, color: "#5a6478", marginTop: 4, textAlign: "right" }}>
                  {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} ✓✓
                </div>
              </div>
            </div>
          );
          return <div key={i}>{renderBotMessage(msg, isLast)}</div>;
        })}
      </div>

      {/* Quick shortcuts */}
      {!isInputScreen && (
        <div style={{ padding: "6px 12px", borderTop: "1px solid #1a3a28", display: "flex", gap: 7, overflowX: "auto" }}>
          {[["🔍 Search", "search_input", "search_prompt"], ["🌾 Rice", "products", "products"], ["🛒 Cart", "cart", "cart_view"]].map(([label, next, bt]) => (
            <button key={label} onClick={() => go(label, next, bt === "products" ? "products" : bt, bt === "products" ? { cat: { name: "Rice", icon: "🌾" } } : {})} style={{ padding: "5px 12px", background: "#1a3a28", border: `1px solid ${WA_ACCENT}30`, borderRadius: 14, color: "#8b96b0", fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>{label}</button>
          ))}
        </div>
      )}

      {/* Input */}
      {isInputScreen && (
        <div style={{ padding: "10px 12px", borderTop: "1px solid #1a3a28", display: "flex", gap: 8, background: "#0d1f18" }}>
          <input
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            placeholder={inputPlaceholder}
            onKeyDown={e => e.key === "Enter" && handleInput()}
            autoFocus
            style={{ flex: 1, padding: "9px 14px", background: "#1a3a28", border: `1.5px solid ${WA_ACCENT}30`, borderRadius: 22, color: "#e8edf5", fontSize: 13, outline: "none" }}
          />
          <button onClick={handleInput} style={{ width: 40, height: 40, background: `linear-gradient(135deg,${WA_GREEN},#00a86b)`, border: "none", borderRadius: "50%", color: "#000", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
        </div>
      )}
    </div>
  );
}

// ── App Shell ──────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [showBot, setShowBot] = useState(false);

  const pages = {
    dashboard: <Dashboard setPage={setPage} />,
    orders: <Orders />,
    products: <Products />,
    categories: <Categories />,
    customers: <Customers />,
    reports: <Reports />,
  };

  return (
    <div style={S.page}>
      <aside style={S.sidebar(collapsed)}>
        <div style={{ padding: collapsed ? "18px 14px" : "20px 18px", borderBottom: "1.5px solid #2a3347", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 26, flexShrink: 0 }}>🌾</span>
          {!collapsed && <div><div style={{ fontWeight: 800, fontSize: 15, color: "#e8edf5" }}>Rice Mandi</div><div style={{ fontSize: 11, color: "#5a6478" }}>Admin Panel</div></div>}
        </div>
        <nav style={{ flex: 1, padding: "12px 8px" }}>
          {NAV.map(item => {
            const active = page === item.id;
            return (
              <button key={item.id} onClick={() => setPage(item.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "11px 0" : "10px 11px", marginBottom: 3, borderRadius: 10, border: "none", background: active ? "rgba(0,214,143,0.1)" : "transparent", color: active ? "#00d68f" : "#8b96b0", fontWeight: active ? 700 : 500, fontSize: 13, justifyContent: collapsed ? "center" : "flex-start", cursor: "pointer" }}>
                <span style={{ fontSize: 17, minWidth: 22, textAlign: "center" }}>{item.icon}</span>
                {!collapsed && item.label}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: "12px 8px", borderTop: "1.5px solid #2a3347" }}>
          {!collapsed && (
            <div style={{ padding: "9px 12px", marginBottom: 8, background: "#1e2536", borderRadius: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#e8edf5" }}>Admin User</div>
              <div style={{ fontSize: 11, color: "#5a6478" }}>admin</div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} style={{ width: "100%", padding: "8px", background: "#1e2536", border: "none", borderRadius: 10, color: "#8b96b0", fontSize: 16, cursor: "pointer" }}>
            {collapsed ? "→" : "←"}
          </button>
        </div>
      </aside>

      <main style={S.main(collapsed)}>{pages[page]}</main>

      {/* WhatsApp FAB */}
      <button onClick={() => setShowBot(!showBot)} style={{ position: "fixed", bottom: 24, right: 24, width: 56, height: 56, background: "linear-gradient(135deg,#25D366,#128C7E)", border: "none", borderRadius: "50%", fontSize: 24, cursor: "pointer", boxShadow: "0 4px 20px #25D36660", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {showBot ? "✕" : "💬"}
      </button>

      {showBot && (
        <div style={{ position: "fixed", bottom: 90, right: 24, width: 370, height: 580, zIndex: 299, borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.6)", border: "1.5px solid #1a3a28" }}>
          <BotPreview />
        </div>
      )}
    </div>
  );
}
