import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '../data/users.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.dirname(DB_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Initialize database
async function initDB() {
  await ensureDataDir();
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify({ users: [], refreshTokens: [] }, null, 2));
  }
}

// Read database
async function readDB() {
  await initDB();
  const data = await fs.readFile(DB_FILE, 'utf8');
  return JSON.parse(data);
}

// Write database
async function writeDB(data) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// User operations
export async function createUser(userData) {
  const db = await readDB();
  const user = {
    id: generateId(),
    ...userData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.users.push(user);
  await writeDB(db);
  return user;
}

export async function getUserByEmail(email) {
  const db = await readDB();
  return db.users.find(user => user.email === email);
}

export async function getUserById(id) {
  const db = await readDB();
  return db.users.find(user => user.id === id);
}

export async function findOrCreateUser(userData) {
  const db = await readDB();
  
  // Check if user exists by email
  let user = db.users.find(u => u.email === userData.email);
  
  if (!user) {
    // Create new user
    user = {
      id: generateId(),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.users.push(user);
    await writeDB(db);
  } else {
    // Update existing user with OAuth data
    user.updatedAt = new Date().toISOString();
    if (userData.googleId) user.googleId = userData.googleId;
    if (userData.githubId) user.githubId = userData.githubId;
    if (userData.avatar) user.avatar = userData.avatar;
    await writeDB(db);
  }
  
  return user;
}

// Refresh token operations
export async function saveRefreshToken(userId, token) {
  const db = await readDB();
  const refreshToken = {
    id: generateId(),
    userId,
    token,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
  };
  db.refreshTokens.push(refreshToken);
  await writeDB(db);
  return refreshToken;
}

export async function getRefreshToken(token) {
  const db = await readDB();
  return db.refreshTokens.find(rt => rt.token === token && new Date(rt.expiresAt) > new Date());
}

export async function deleteRefreshToken(token) {
  const db = await readDB();
  db.refreshTokens = db.refreshTokens.filter(rt => rt.token !== token);
  await writeDB(db);
}

export async function deleteUserRefreshTokens(userId) {
  const db = await readDB();
  db.refreshTokens = db.refreshTokens.filter(rt => rt.userId !== userId);
  await writeDB(db);
}