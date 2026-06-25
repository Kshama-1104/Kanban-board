const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json());

// --- Database Setup ---
const db = new Database(path.join(__dirname, 'kanban.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS boards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS card_lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    board_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    position INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_list_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATETIME,
    position INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (card_list_id) REFERENCES card_lists(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS card_tag (
    card_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (card_id, tag_id),
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS card_member (
    card_id INTEGER NOT NULL,
    member_id INTEGER NOT NULL,
    PRIMARY KEY (card_id, member_id),
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
  );
`);

// --- Seed default data if empty ---
const boardCount = db.prepare('SELECT COUNT(*) as count FROM boards').get().count;
if (boardCount === 0) {
  // Create a default board
  const insertBoard = db.prepare('INSERT INTO boards (name) VALUES (?)');
  const boardResult = insertBoard.run('My First Board');
  const boardId = boardResult.lastInsertRowid;

  // Create default lists
  const insertList = db.prepare('INSERT INTO card_lists (board_id, name, position) VALUES (?, ?, ?)');
  const todoList = insertList.run(boardId, 'To Do', 0);
  const doingList = insertList.run(boardId, 'In Progress', 1);
  const doneList = insertList.run(boardId, 'Done', 2);

  // Create sample tags
  const insertTag = db.prepare('INSERT INTO tags (name, color) VALUES (?, ?)');
  insertTag.run('Bug', '#ef4444');
  insertTag.run('Feature', '#3b82f6');
  insertTag.run('Urgent', '#f97316');
  insertTag.run('Design', '#a855f7');
  insertTag.run('Backend', '#10b981');
  insertTag.run('Frontend', '#06b6d4');

  // Create sample members
  const insertMember = db.prepare('INSERT INTO members (name, email) VALUES (?, ?)');
  insertMember.run('Alice Johnson', 'alice@example.com');
  insertMember.run('Bob Smith', 'bob@example.com');
  insertMember.run('Carol Williams', 'carol@example.com');
  insertMember.run('Dave Brown', 'dave@example.com');

  // Create sample cards
  const insertCard = db.prepare('INSERT INTO cards (card_list_id, title, description, due_date, position) VALUES (?, ?, ?, ?, ?)');
  const card1 = insertCard.run(todoList.lastInsertRowid, 'Set up project structure', 'Initialize the repository and set up CI/CD pipeline', '2026-07-01T10:00:00', 0);
  const card2 = insertCard.run(todoList.lastInsertRowid, 'Design database schema', 'Create ERD and define all table relationships', '2026-07-03T14:00:00', 1);
  const card3 = insertCard.run(doingList.lastInsertRowid, 'Build authentication module', 'Implement login, register, and JWT token flow', '2026-06-28T09:00:00', 0);
  const card4 = insertCard.run(doneList.lastInsertRowid, 'Create wireframes', 'Design low-fidelity wireframes for all pages', null, 0);

  // Assign tags and members to cards
  const insertCardTag = db.prepare('INSERT INTO card_tag (card_id, tag_id) VALUES (?, ?)');
  const insertCardMember = db.prepare('INSERT INTO card_member (card_id, member_id) VALUES (?, ?)');

  insertCardTag.run(card1.lastInsertRowid, 2); // Feature
  insertCardTag.run(card2.lastInsertRowid, 5); // Backend
  insertCardTag.run(card3.lastInsertRowid, 3); // Urgent
  insertCardTag.run(card3.lastInsertRowid, 5); // Backend
  insertCardTag.run(card4.lastInsertRowid, 4); // Design

  insertCardMember.run(card1.lastInsertRowid, 1); // Alice
  insertCardMember.run(card2.lastInsertRowid, 2); // Bob
  insertCardMember.run(card3.lastInsertRowid, 1); // Alice
  insertCardMember.run(card3.lastInsertRowid, 3); // Carol
  insertCardMember.run(card4.lastInsertRowid, 4); // Dave

  console.log('✅ Seeded default board, lists, cards, tags, and members');
}

// --- Helper: get tags for a card ---
function getCardTags(cardId) {
  return db.prepare(`
    SELECT t.* FROM tags t
    JOIN card_tag ct ON ct.tag_id = t.id
    WHERE ct.card_id = ?
  `).all(cardId);
}

// --- Helper: get members for a card ---
function getCardMembers(cardId) {
  return db.prepare(`
    SELECT m.* FROM members m
    JOIN card_member cm ON cm.member_id = m.id
    WHERE cm.card_id = ?
  `).all(cardId);
}

// --- Helper: enrich card with relations ---
function enrichCard(card) {
  return {
    ...card,
    tags: getCardTags(card.id),
    members: getCardMembers(card.id),
  };
}

// =====================
// BOARDS API
// =====================
app.get('/api/boards', (req, res) => {
  const boards = db.prepare('SELECT * FROM boards ORDER BY id').all();
  res.json(boards);
});

app.get('/api/boards/:id', (req, res) => {
  const board = db.prepare('SELECT * FROM boards WHERE id = ?').get(req.params.id);
  if (!board) return res.status(404).json({ message: 'Board not found' });

  const cardLists = db.prepare('SELECT * FROM card_lists WHERE board_id = ? ORDER BY position').all(board.id);

  board.card_lists = cardLists.map(list => {
    const cards = db.prepare('SELECT * FROM cards WHERE card_list_id = ? ORDER BY position').all(list.id);
    list.cards = cards.map(enrichCard);
    return list;
  });

  res.json(board);
});

app.post('/api/boards', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(422).json({ message: 'Name is required' });

  const result = db.prepare('INSERT INTO boards (name) VALUES (?)').run(name);
  const board = db.prepare('SELECT * FROM boards WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(board);
});

app.delete('/api/boards/:id', (req, res) => {
  const board = db.prepare('SELECT * FROM boards WHERE id = ?').get(req.params.id);
  if (!board) return res.status(404).json({ message: 'Board not found' });

  db.prepare('DELETE FROM boards WHERE id = ?').run(req.params.id);
  res.json({ message: 'Board deleted successfully' });
});

// =====================
// CARD LISTS API
// =====================
app.post('/api/card-lists', (req, res) => {
  const { board_id, name, position } = req.body;
  if (!board_id || !name) return res.status(422).json({ message: 'board_id and name are required' });

  const pos = position ?? db.prepare('SELECT COUNT(*) as count FROM card_lists WHERE board_id = ?').get(board_id).count;
  const result = db.prepare('INSERT INTO card_lists (board_id, name, position) VALUES (?, ?, ?)').run(board_id, name, pos);
  const list = db.prepare('SELECT * FROM card_lists WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(list);
});

app.put('/api/card-lists/:id', (req, res) => {
  const list = db.prepare('SELECT * FROM card_lists WHERE id = ?').get(req.params.id);
  if (!list) return res.status(404).json({ message: 'List not found' });

  const { name, position } = req.body;
  db.prepare('UPDATE card_lists SET name = COALESCE(?, name), position = COALESCE(?, position), updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(name || null, position ?? null, req.params.id);

  const updated = db.prepare('SELECT * FROM card_lists WHERE id = ?').get(req.params.id);
  res.json(updated);
});

app.put('/api/card-lists/positions', (req, res) => {
  const { positions } = req.body;
  if (!positions) return res.status(422).json({ message: 'positions array required' });

  const stmt = db.prepare('UPDATE card_lists SET position = ? WHERE id = ?');
  const updateMany = db.transaction((items) => {
    for (const item of items) stmt.run(item.position, item.id);
  });
  updateMany(positions);
  res.json({ message: 'List positions updated successfully' });
});

app.delete('/api/card-lists/:id', (req, res) => {
  const list = db.prepare('SELECT * FROM card_lists WHERE id = ?').get(req.params.id);
  if (!list) return res.status(404).json({ message: 'List not found' });

  db.prepare('DELETE FROM card_lists WHERE id = ?').run(req.params.id);
  res.json({ message: 'List deleted successfully' });
});

// =====================
// CARDS API
// =====================
app.post('/api/cards', (req, res) => {
  const { card_list_id, title, description, due_date, position } = req.body;
  if (!card_list_id || !title) return res.status(422).json({ message: 'card_list_id and title are required' });

  const pos = position ?? db.prepare('SELECT COUNT(*) as count FROM cards WHERE card_list_id = ?').get(card_list_id).count;
  const result = db.prepare('INSERT INTO cards (card_list_id, title, description, due_date, position) VALUES (?, ?, ?, ?, ?)')
    .run(card_list_id, title, description || null, due_date || null, pos);

  const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(enrichCard(card));
});

app.put('/api/cards/:id', (req, res) => {
  const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(req.params.id);
  if (!card) return res.status(404).json({ message: 'Card not found' });

  const { card_list_id, title, description, due_date, position, tags, members } = req.body;

  db.prepare(`
    UPDATE cards SET 
      card_list_id = COALESCE(?, card_list_id),
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      due_date = COALESCE(?, due_date),
      position = COALESCE(?, position),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(card_list_id || null, title || null, description ?? null, due_date ?? null, position ?? null, req.params.id);

  // Sync tags
  if (tags !== undefined) {
    db.prepare('DELETE FROM card_tag WHERE card_id = ?').run(req.params.id);
    const insertTag = db.prepare('INSERT INTO card_tag (card_id, tag_id) VALUES (?, ?)');
    for (const tagId of tags) insertTag.run(req.params.id, tagId);
  }

  // Sync members
  if (members !== undefined) {
    db.prepare('DELETE FROM card_member WHERE card_id = ?').run(req.params.id);
    const insertMember = db.prepare('INSERT INTO card_member (card_id, member_id) VALUES (?, ?)');
    for (const memberId of members) insertMember.run(req.params.id, memberId);
  }

  const updated = db.prepare('SELECT * FROM cards WHERE id = ?').get(req.params.id);
  res.json(enrichCard(updated));
});

app.delete('/api/cards/:id', (req, res) => {
  const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(req.params.id);
  if (!card) return res.status(404).json({ message: 'Card not found' });

  db.prepare('DELETE FROM cards WHERE id = ?').run(req.params.id);
  res.json({ message: 'Card deleted successfully' });
});

app.put('/api/cards/positions', (req, res) => {
  const { positions } = req.body;
  if (!positions) return res.status(422).json({ message: 'positions array required' });

  const stmt = db.prepare('UPDATE cards SET card_list_id = ?, position = ? WHERE id = ?');
  const updateMany = db.transaction((items) => {
    for (const item of items) stmt.run(item.card_list_id, item.position, item.id);
  });
  updateMany(positions);
  res.json({ message: 'Card positions updated successfully' });
});

// =====================
// TAGS API
// =====================
app.get('/api/tags', (req, res) => {
  const tags = db.prepare('SELECT * FROM tags ORDER BY id').all();
  res.json(tags);
});

app.post('/api/tags', (req, res) => {
  const { name, color } = req.body;
  if (!name || !color) return res.status(422).json({ message: 'name and color are required' });

  const result = db.prepare('INSERT INTO tags (name, color) VALUES (?, ?)').run(name, color);
  const tag = db.prepare('SELECT * FROM tags WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(tag);
});

// =====================
// MEMBERS API
// =====================
app.get('/api/members', (req, res) => {
  const members = db.prepare('SELECT * FROM members ORDER BY id').all();
  res.json(members);
});

app.post('/api/members', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(422).json({ message: 'name and email are required' });

  try {
    const result = db.prepare('INSERT INTO members (name, email) VALUES (?, ?)').run(name, email);
    const member = db.prepare('SELECT * FROM members WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(member);
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(422).json({ message: 'Email already exists' });
    }
    throw err;
  }
});

// =====================
// START SERVER
// =====================
app.listen(PORT, () => {
  console.log(`\n🚀 Kanban API Server running at http://localhost:${PORT}`);
  console.log(`📋 API endpoints available at http://localhost:${PORT}/api/\n`);
});
