import React, { useState } from 'react';
import CardDetailModal from './CardDetailModal';

export default function KanbanBoard({ board, allTags, allMembers, onRefresh }) {
  const [editingCard, setEditingCard] = useState(null);
  const [newListLabel, setNewListLabel] = useState('');
  const [newCardTitles, setNewCardTitles] = useState({}); // listId -> title

  const API_URL = 'http://localhost:8000/api';

  // Drag and Drop implementation
  const handleDragStart = (e, card, listId) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ cardId: card.id, sourceListId: listId }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = async (e, targetListId) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (!dataStr) return;
      
      const { cardId, sourceListId } = JSON.parse(dataStr);
      if (sourceListId === targetListId) return;

      // Update card's list ID on backend
      await fetch(`${API_URL}/cards/${cardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_list_id: targetListId }),
      });

      onRefresh();
    } catch (err) {
      console.error('Error dropping card:', err);
    }
  };

  // Accessibility Arrow Move (Fallback for touch screens/keyboards)
  const moveCardArrow = async (card, currentListId, direction) => {
    const listIndex = board.card_lists.findIndex(l => l.id === currentListId);
    if (listIndex === -1) return;

    let targetListIndex = direction === 'left' ? listIndex - 1 : listIndex + 1;
    if (targetListIndex < 0 || targetListIndex >= board.card_lists.length) return;

    const targetListId = board.card_lists[targetListIndex].id;

    try {
      await fetch(`${API_URL}/cards/${card.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_list_id: targetListId }),
      });
      onRefresh();
    } catch (err) {
      console.error('Error shifting card:', err);
    }
  };

  // Add List
  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListLabel.trim()) return;

    try {
      await fetch(`${API_URL}/card-lists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          board_id: board.id,
          name: newListLabel,
        }),
      });
      setNewListLabel('');
      onRefresh();
    } catch (err) {
      console.error('Error adding list:', err);
    }
  };

  // Add Card
  const handleCreateCard = async (listId) => {
    const title = newCardTitles[listId];
    if (!title || !title.trim()) return;

    try {
      await fetch(`${API_URL}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_list_id: listId,
          title: title,
        }),
      });
      
      setNewCardTitles(prev => ({ ...prev, [listId]: '' }));
      onRefresh();
    } catch (err) {
      console.error('Error adding card:', err);
    }
  };

  // Update Card from modal
  const handleUpdateCard = async (updatedFields) => {
    try {
      await fetch(`${API_URL}/cards/${updatedFields.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
      setEditingCard(null);
      onRefresh();
    } catch (err) {
      console.error('Error updating card:', err);
    }
  };

  // Delete Card
  const handleDeleteCard = async (cardId) => {
    if (!confirm('Are you sure you want to delete this card?')) return;
    try {
      await fetch(`${API_URL}/cards/${cardId}`, {
        method: 'DELETE',
      });
      setEditingCard(null);
      onRefresh();
    } catch (err) {
      console.error('Error deleting card:', err);
    }
  };

  const isOverdue = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  const formatDueDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div className="board-wrapper">
        {board.card_lists && board.card_lists.map((list, listIndex) => (
          <div 
            key={list.id} 
            className="board-column"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, list.id)}
          >
            <div className="column-header">
              <div className="column-title-group">
                <h4 className="column-title">{list.name}</h4>
                <span className="card-count">{list.cards ? list.cards.length : 0}</span>
              </div>
            </div>

            <div className="column-cards">
              {list.cards && list.cards.map(card => {
                const overdue = isOverdue(card.due_date);
                return (
                  <div 
                    key={card.id} 
                    className={`card-item ${overdue ? 'overdue' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, card, list.id)}
                    onClick={() => setEditingCard(card)}
                  >
                    {/* Accessibility Movement Buttons */}
                    <div className="card-move-controls" onClick={(e) => e.stopPropagation()}>
                      {listIndex > 0 && (
                        <button 
                          className="btn-move-arrow" 
                          title="Move Left"
                          onClick={() => moveCardArrow(card, list.id, 'left')}
                        >
                          &larr;
                        </button>
                      )}
                      {listIndex < board.card_lists.length - 1 && (
                        <button 
                          className="btn-move-arrow" 
                          title="Move Right"
                          onClick={() => moveCardArrow(card, list.id, 'right')}
                        >
                          &rarr;
                        </button>
                      )}
                    </div>

                    <h5 className="card-title">{card.title}</h5>
                    
                    {card.description && (
                      <p className="card-description-preview">{card.description}</p>
                    )}

                    {card.tags && card.tags.length > 0 && (
                      <div className="card-tags">
                        {card.tags.map(tag => (
                          <span 
                            key={tag.id} 
                            className="tag-badge"
                            style={{ backgroundColor: tag.color }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="card-meta">
                      {card.due_date && (
                        <span className={`card-due-date ${overdue ? 'overdue' : ''}`}>
                          ⏰ {formatDueDate(card.due_date)}
                        </span>
                      )}

                      {card.members && card.members.length > 0 && (
                        <div className="card-members-avatar-group">
                          {card.members.map(member => {
                            const initials = member.name.split(' ').map(n => n[0]).join('');
                            return (
                              <div key={member.id} className="avatar-circle" title={member.name}>
                                {initials}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="column-footer">
              <input 
                type="text" 
                placeholder="+ Add card..." 
                className="form-control"
                style={{ fontSize: '13px', padding: '6px 10px', background: 'rgba(255,255,255,0.02)', borderStyle: 'dashed' }}
                value={newCardTitles[list.id] || ''}
                onChange={(e) => setNewCardTitles(prev => ({ ...prev, [list.id]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateCard(list.id);
                }}
              />
            </div>
          </div>
        ))}

        {/* Add New List Panel */}
        <div className="board-column" style={{ background: 'rgba(255,255,255,0.02)', borderStyle: 'dashed' }}>
          <div className="column-header">
            <h4 className="column-title" style={{ color: 'var(--text-secondary)' }}>Add New List</h4>
          </div>
          <div className="column-footer">
            <form onSubmit={handleCreateList}>
              <input 
                type="text" 
                placeholder="List title..." 
                className="form-control" 
                style={{ marginBottom: '10px' }}
                value={newListLabel}
                onChange={(e) => setNewListLabel(e.target.value)}
              />
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Create Column
              </button>
            </form>
          </div>
        </div>
      </div>

      {editingCard && (
        <CardDetailModal 
          card={editingCard}
          allTags={allTags}
          allMembers={allMembers}
          onClose={() => setEditingCard(null)}
          onSave={handleUpdateCard}
        />
      )}
    </div>
  );
}
