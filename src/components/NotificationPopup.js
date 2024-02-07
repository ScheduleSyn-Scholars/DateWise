import React, { useState } from 'react';
import './NotificationPopup.css';

const NotificationPopup = ({
    notifications,
    handleAccept,
    handleDecline,
    onClose,
}) => {
    // const [showNotification, setShowNotification] = useState(false);

    // onClose=() => setShowNotification(false);

    return (
        <div className="notification-popup">
            {notifications.map((notification, index) => (
                <div key={index} className="notification-entry">
                    <p>
                        <strong>Sender:</strong> {notification.sender}
                    </p>
                    <p>
                        <strong>Message:</strong> {notification.message}
                    </p>
                    <div className="decision-buttons">
                        <button
                            className="Accept-button"
                            onClick={() => handleAccept(index)}
                        >
                            Accept
                        </button>
                        <button
                            className="Decline-button"
                            onClick={() => handleDecline(index)}
                        >
                            Decline
                        </button>
                    </div>
                </div>
            ))}
            <button className="close-button" onClick={onClose}>
                Close
            </button>
        </div>
    );
};

export default NotificationPopup;
