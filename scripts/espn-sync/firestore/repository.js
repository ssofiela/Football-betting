// Narrow CRUD layer over the match collection. All methods take
// `collectionName` so the same repo works across tournaments.

const { db } = require('./admin');

function collection(name) {
  return db().collection(name);
}

async function listMatches(collectionName) {
  const snap = await collection(collectionName).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function getMatch(collectionName, espnId) {
  const snap = await collection(collectionName).doc(String(espnId)).get();
  return snap.exists ? { id: snap.id, ...snap.data() } : null;
}

async function createMatch(collectionName, doc) {
  if (!doc.espnId) throw new Error('createMatch requires doc.espnId');
  await collection(collectionName).doc(String(doc.espnId)).set(doc);
}

async function updateMatch(collectionName, espnId, partial) {
  if (!partial || Object.keys(partial).length === 0) return false;
  await collection(collectionName).doc(String(espnId)).update(partial);
  return true;
}

async function isEmpty(collectionName) {
  const snap = await collection(collectionName).limit(1).get();
  return snap.empty;
}

module.exports = {
  listMatches,
  getMatch,
  createMatch,
  updateMatch,
  isEmpty,
};
