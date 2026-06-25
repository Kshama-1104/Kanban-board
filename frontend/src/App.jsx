import React, { useState, useEffect } from 'react';
import KanbanBoard from './components/KanbanBoard';

export default function App() {
  const [boards, setBoards] = useState([]);
  const [selectedBoardId, setSelectedBoardId] = useState('');
  const [activeBoard, setActiveBoard] = useState(null);
  const [allTags, setAllTags] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [newBoardName, setNewBoardName] = useState('');
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:8000/api';

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedBoardId) {
      fetchBoardDetails(selectedBoardId);
    } else {
      setActiveBoard(null);
    }
  }, [selectedBoardId]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Fetch Boards
      const boardsRes = await fetch(`${API_URL}/boards`);
      const boardsData = await boardsRes.json();
      setBoards(boardsData);

      if (boardsData.length > 0) {
        setSelectedBoardId(boardsData[0].id);
      }

      // Fetch Tags
      const tagsRes = await fetch(`${API_URL}/tags`);
      const tagsData = await tagsRes.json();
      setAllTags(tagsData);

      // Fetch Members
      const membersRes = await fetch(`${API_URL}/members`);
      const membersData = await membersRes.json();
      setAllMembers(membersData);
    } catch (err) {
      console.error('Error fetching initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBoardDetails = async (boardId) => {
    try {
      const res = await fetch(`${API_URL}/boards/${boardId}`);
      const data = await res.json();
      setActiveBoard(data);
    } catch (err) {
      console.error('Error fetching board details:', err);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;

    try {
      const res = await fetch(`${API_URL}/boards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBoardName }),
      });
      const newBoard = await res.json();
      setBoards(prev => [...prev, newBoard]);
      setSelectedBoardId(newBoard.id);
      setNewBoardName('');
    } catch (err) {
      console.error('Error creating board:', err);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-logo">K</div>
          <h1 className="brand-title">Kanban Flow</h1>
        </div>

        <div className="controls-section">
          {/* Board Selector */}
          <div className="select-wrapper">
            <select 
              className="board-select" 
              value={selectedBoardId} 
              onChange={(e) => setSelectedBoardId(e.target.value)}
            >
              {boards.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Quick Create Board */}
          <form onSubmit={handleCreateBoard} style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="New Board name..." 
              className="form-control"
              style={{ width: '180px', padding: '8px 12px' }}
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
            />
            <button type="submit" className="btn-primary">
              Create Board
            </button>
          </form>
        </div>
      </header>

      {loading ? (
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
          Loading Board details...
        </div>
      ) : activeBoard ? (
        <KanbanBoard 
          board={activeBoard}
          allTags={allTags}
          allMembers={allMembers}
          onRefresh={() => fetchBoardDetails(selectedBoardId)}
        />
      ) : (
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
          <p style={{ marginBottom: '16px' }}>No Boards found. Create a board to get started!</p>
        </div>
      )}
    </div>
  );
}
