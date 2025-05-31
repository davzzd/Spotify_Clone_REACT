import React from 'react';
import './Notification.css';

function Notification({ message, isVisible, onClose }) {
  if (!isVisible) return null;

  return (
    <div className="notification-overlay">
      <div className="notification">
        <p>{message}</p>
        <button onClick={onClose}>Got it</button>
      </div>
    </div>
  );
}

export default Notification; 