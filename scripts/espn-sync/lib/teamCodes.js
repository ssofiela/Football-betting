// ESPN's soccer team `abbreviation` is usually ISO3 (e.g. "ESP", "USA").
// This module normalizes to the codes the React app's `getFlag` helper
// expects. Add overrides here when ESPN uses something non-standard.

const OVERRIDES = {
  // ESPN-specific → ISO3. Keep this small; most codes pass through.
};

function toIso3(raw) {
  if (!raw) return 'UND';
  const upper = String(raw).toUpperCase().trim();
  if (upper.length !== 3) return 'UND';
  return OVERRIDES[upper] || upper;
}

module.exports = { toIso3 };
