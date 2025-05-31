import React from 'react';
import './Notification.css';

function Notification({ isVisible, message, onClose }) {
    if (!isVisible) return null;

    return (
        <div className="notification_overlay">
            <div className="notification">
                <div className="notification_content">
                    <p className="notification_message">{message}</p>
                    <button className="notification_button" onClick={onClose}>
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Notification; 