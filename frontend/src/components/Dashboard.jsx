import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'https://lost-and-found-1-xbsq.onrender.com';

// ── Helpers ──────────────────────────────────────────────────────────────────
const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// ── Empty add-item form ───────────────────────────────────────────────────────
const EMPTY_FORM = {
  itemName: '',
  description: '',
  type: 'Lost',
  location: '',
  date: '',
  contactInfo: '',
};

// ════════════════════════════════════════════════════════════════════════════
//  ItemCard — displays a single lost/found item
// ════════════════════════════════════════════════════════════════════════════
function ItemCard({ item, currentUserId, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    itemName: item.itemName,
    description: item.description,
    type: item.type,
    location: item.location,
    date: item.date ? item.date.slice(0, 10) : '',
    contactInfo: item.contactInfo,
  });
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);

  const isOwner =
    item.postedBy && item.postedBy._id === currentUserId;

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
    setEditError('');
  };

  const handleSave = async () => {
    setSaving(true);
    setEditError('');
    try {
      const { data } = await axios.put(
        `${API_BASE}/api/items/${item._id}`,
        editData,
        { headers: getAuthHeader() }
      );
      onUpdate(data);
      setEditing(false);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update item.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${item.itemName}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API_BASE}/api/items/${item._id}`, {
        headers: getAuthHeader(),
      });
      onDelete(item._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete item.');
    }
  };

  return (
    <div className="item-card">
      {/* Header */}
      <div className="item-card-header">
        <h3 className="item-name">{item.itemName}</h3>
        <span className={`badge badge-${item.type.toLowerCase()}`}>
          {item.type === 'Lost' ? '❗' : '✅'} {item.type}
        </span>
      </div>

      {/* Description */}
      <p className="item-description">{item.description}</p>

      {/* Meta */}
      <div className="item-meta">
        <div className="meta-row">
          <span className="meta-icon">📍</span>
          <span className="meta-label">Location:</span>
          <span className="meta-value">{item.location}</span>
        </div>
        <div className="meta-row">
          <span className="meta-icon">📅</span>
          <span className="meta-label">Date:</span>
          <span className="meta-value">{formatDate(item.date)}</span>
        </div>
        <div className="meta-row">
          <span className="meta-icon">📞</span>
          <span className="meta-label">Contact:</span>
          <span className="meta-value">{item.contactInfo}</span>
        </div>
        {item.postedBy && (
          <div className="meta-row">
            <span className="meta-icon">👤</span>
            <span className="meta-label">Posted by:</span>
            <span className="meta-value">{item.postedBy.name}</span>
          </div>
        )}
      </div>

      {/* Owner Actions */}
      {isOwner && (
        <div className="item-actions">
          <button
            id={`edit-btn-${item._id}`}
            className="btn btn-edit btn-sm"
            onClick={() => setEditing((prev) => !prev)}
          >
            {editing ? '✕ Cancel' : '✏️ Edit'}
          </button>
          <button
            id={`delete-btn-${item._id}`}
            className="btn btn-danger btn-sm"
            onClick={handleDelete}
          >
            🗑️ Delete
          </button>
        </div>
      )}

      {/* Inline Edit Form */}
      {editing && (
        <div className="edit-form">
          {editError && (
            <div className="alert alert-error" style={{ marginBottom: '8px' }}>
              ⚠️ {editError}
            </div>
          )}
          <input
            type="text"
            name="itemName"
            placeholder="Item Name"
            value={editData.itemName}
            onChange={handleEditChange}
          />
          <textarea
            name="description"
            placeholder="Description"
            value={editData.description}
            onChange={handleEditChange}
          />
          <select name="type" value={editData.type} onChange={handleEditChange}>
            <option value="Lost">Lost</option>
            <option value="Found">Found</option>
          </select>
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={editData.location}
            onChange={handleEditChange}
          />
          <input
            type="date"
            name="date"
            value={editData.date}
            onChange={handleEditChange}
          />
          <input
            type="text"
            name="contactInfo"
            placeholder="Contact Info"
            value={editData.contactInfo}
            onChange={handleEditChange}
          />
          <div className="edit-form-actions">
            <button
              id={`save-btn-${item._id}`}
              className="btn btn-success btn-sm"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? '⏳ Saving…' : '💾 Save Changes'}
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  Dashboard
// ════════════════════════════════════════════════════════════════════════════
function Dashboard() {
  const navigate = useNavigate();

  // ── Auth guard ──────────────────────────────────────────────────────────
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    if (!token) navigate('/', { replace: true });
  }, [token, navigate]);

  // ── State ───────────────────────────────────────────────────────────────
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [itemsError, setItemsError] = useState('');

  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchActive, setSearchActive] = useState(false);

  // ── Fetch all items ─────────────────────────────────────────────────────
  const fetchItems = useCallback(async () => {
    setLoadingItems(true);
    setItemsError('');
    try {
      const { data } = await axios.get(`${API_BASE}/api/items`);
      setItems(data);
      setSearchActive(false);
    } catch (err) {
      setItemsError(err.response?.data?.message || 'Failed to load items.');
    } finally {
      setLoadingItems(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // ── Add item ────────────────────────────────────────────────────────────
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);

    try {
      const { data } = await axios.post(`${API_BASE}/api/items`, form, {
        headers: getAuthHeader(),
      });
      setItems((prev) => [data, ...prev]);
      setForm(EMPTY_FORM);
      setFormSuccess('Item posted successfully!');
      setTimeout(() => setFormSuccess(''), 3000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to post item.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Search ──────────────────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setItemsError('');
    try {
      const { data } = await axios.get(
        `${API_BASE}/api/items/search?name=${encodeURIComponent(searchQuery.trim())}`
      );
      setItems(data);
      setSearchActive(true);
    } catch (err) {
      setItemsError(err.response?.data?.message || 'Search failed.');
    } finally {
      setSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    fetchItems();
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  // ── Item updates from cards ──────────────────────────────────────────────
  const handleItemUpdate = (updatedItem) => {
    setItems((prev) =>
      prev.map((it) => (it._id === updatedItem._id ? updatedItem : it))
    );
  };

  const handleItemDelete = (deletedId) => {
    setItems((prev) => prev.filter((it) => it._id !== deletedId));
  };

  // ── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/', { replace: true });
  };

  // ── Derived stats ─────────────────────────────────────────────────────────
  const lostCount = items.filter((it) => it.type === 'Lost').length;
  const foundCount = items.filter((it) => it.type === 'Found').length;

  if (!token) return null;

  return (
    <div className="dashboard">
      {/* ── Header ── */}
      <header className="dashboard-header">
        <div className="header-inner">
          <div className="header-brand">
            <div className="header-icon">🔍</div>
            <div>
              <div className="header-title">Lost &amp; Found</div>
              <div className="header-subtitle">Campus Item Management Portal</div>
            </div>
          </div>

          <div className="header-right">
            {currentUser && (
              <span className="welcome-text">
                Hello, <strong>{currentUser.name}</strong>
              </span>
            )}
            <button
              id="logout-btn"
              className="btn-logout"
              onClick={handleLogout}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="dashboard-content">
        {/* ── Left Column: Add Item Form ── */}
        <aside>
          <div className="section-card">
            <h2 className="section-title">
              <span>📦</span> Report an Item
            </h2>

            {formError && <div className="alert alert-error">⚠️ {formError}</div>}
            {formSuccess && <div className="alert alert-success">✅ {formSuccess}</div>}

            <form onSubmit={handleAddItem} noValidate>
              <div className="form-group">
                <label htmlFor="item-name">Item Name</label>
                <input
                  id="item-name"
                  type="text"
                  name="itemName"
                  placeholder="e.g. Blue Water Bottle"
                  value={form.itemName}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="item-desc">Description</label>
                <textarea
                  id="item-desc"
                  name="description"
                  placeholder="Describe the item in detail…"
                  value={form.description}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="item-type">Type</label>
                <select
                  id="item-type"
                  name="type"
                  value={form.type}
                  onChange={handleFormChange}
                  required
                >
                  <option value="Lost">Lost</option>
                  <option value="Found">Found</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="item-location">Location</label>
                <input
                  id="item-location"
                  type="text"
                  name="location"
                  placeholder="e.g. Library, Block B"
                  value={form.location}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="item-date">Date</label>
                <input
                  id="item-date"
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="item-contact">Contact Info</label>
                <input
                  id="item-contact"
                  type="text"
                  name="contactInfo"
                  placeholder="Phone / email / room no."
                  value={form.contactInfo}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <button
                id="add-item-btn"
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? '⏳ Posting…' : '➕ Post Item'}
              </button>
            </form>
          </div>
        </aside>

        {/* ── Right Column: Search + Items ── */}
        <div className="right-column">
          {/* Search */}
          <div className="section-card">
            <h2 className="section-title">
              <span>🔎</span> Search Items
            </h2>
            <div className="search-bar">
              <input
                id="search-input"
                type="text"
                placeholder="Search by name or description…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
              <div className="search-actions">
                <button
                  id="search-btn"
                  className="btn btn-edit"
                  onClick={handleSearch}
                  disabled={searching}
                >
                  {searching ? '⏳' : '🔍 Search'}
                </button>
                {searchActive && (
                  <button
                    id="clear-search-btn"
                    className="btn btn-outline"
                    onClick={handleClearSearch}
                  >
                    ✕ Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Items list */}
          <div className="section-card">
            <div className="section-title" style={{ marginBottom: '12px' }}>
              <span>📋</span>
              {searchActive
                ? `Search Results (${items.length})`
                : 'All Items'}
            </div>

            {/* Stats */}
            {!searchActive && (
              <div className="stats-strip">
                <div className="stat-chip">
                  Total: <span className="count">{items.length}</span>
                </div>
                <div className="stat-chip">
                  ❗ Lost: <span className="count">{lostCount}</span>
                </div>
                <div className="stat-chip">
                  ✅ Found: <span className="count">{foundCount}</span>
                </div>
              </div>
            )}

            {/* Error */}
            {itemsError && (
              <div className="alert alert-error">⚠️ {itemsError}</div>
            )}

            {/* Loading */}
            {loadingItems ? (
              <div className="spinner-wrap">
                <div className="spinner" />
                <span>Loading items…</span>
              </div>
            ) : items.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  {searchActive ? '🔍' : '📭'}
                </div>
                <h3>
                  {searchActive
                    ? 'No items matched your search'
                    : 'No items yet'}
                </h3>
                <p>
                  {searchActive
                    ? 'Try a different keyword'
                    : 'Be the first to report a lost or found item!'}
                </p>
              </div>
            ) : (
              <div className="items-grid">
                {items.map((item) => (
                  <ItemCard
                    key={item._id}
                    item={item}
                    currentUserId={currentUser?.id}
                    onDelete={handleItemDelete}
                    onUpdate={handleItemUpdate}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
