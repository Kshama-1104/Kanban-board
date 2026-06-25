import React, { useState, useEffect, useRef } from 'react';

export default function CardDetailModal({ card, allTags, allMembers, onClose, onSave }) {
  const dialogRef = useRef(null);
  
  const [title, setTitle] = useState(card.title || '');
  const [description, setDescription] = useState(card.description || '');
  const [dueDate, setDueDate] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);

  // Initialize fields
  useEffect(() => {
    setTitle(card.title || '');
    setDescription(card.description || '');
    
    // Format date for datetime-local input (YYYY-MM-DDThh:mm)
    if (card.due_date) {
      const date = new Date(card.due_date);
      const formatted = date.toISOString().slice(0, 16);
      setDueDate(formatted);
    } else {
      setDueDate('');
    }

    setSelectedTagIds(card.tags ? card.tags.map(t => t.id) : []);
    setSelectedMemberIds(card.members ? card.members.map(m => m.id) : []);
  }, [card]);

  // Open modal native flow
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }

    // Fallback for light-dismiss click outside content box
    const handleBackdropClick = (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const isDialogContent = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );
      if (!isDialogContent) {
        onClose();
      }
    };

    if (dialog) {
      dialog.addEventListener('click', handleBackdropClick);
    }

    return () => {
      if (dialog) {
        dialog.removeEventListener('click', handleBackdropClick);
      }
    };
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: card.id,
      title,
      description,
      due_date: dueDate || null,
      tags: selectedTagIds,
      members: selectedMemberIds,
    });
  };

  const toggleTag = (tagId) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const toggleMember = (memberId) => {
    setSelectedMemberIds(prev => 
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    );
  };

  return (
    <dialog ref={dialogRef} closedby="any" onClose={onClose}>
      <div className="dialog-header">
        <h3 className="dialog-title">Edit Card Details</h3>
        <button className="btn-close-dialog" onClick={onClose}>&times;</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Title</label>
          <input 
            type="text" 
            className="form-control" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea 
            className="form-control" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Due Date</label>
          <input 
            type="datetime-local" 
            className="form-control" 
            value={dueDate} 
            onChange={(e) => setDueDate(e.target.value)} 
          />
        </div>

        <div className="form-group">
          <label className="form-label">Tags</label>
          <div className="tag-selection-grid">
            {allTags.map(tag => {
              const isSelected = selectedTagIds.includes(tag.id);
              return (
                <div 
                  key={tag.id} 
                  className={`tag-select-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleTag(tag.id)}
                >
                  <span className="color-dot" style={{ backgroundColor: tag.color }}></span>
                  <span>{tag.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Members</label>
          <div className="member-selection-grid">
            {allMembers.map(member => {
              const isSelected = selectedMemberIds.includes(member.id);
              const initials = member.name.split(' ').map(n => n[0]).join('');
              return (
                <div 
                  key={member.id} 
                  className={`member-select-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleMember(member.id)}
                >
                  <div className="avatar-circle" style={{ marginLeft: 0, width: 20, height: 20, fontSize: 8 }}>
                    {initials}
                  </div>
                  <span>{member.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="dialog-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary">Save Changes</button>
        </div>
      </form>
    </dialog>
  );
}
