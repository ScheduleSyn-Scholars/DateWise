import React, { useState } from 'react';

const NotificationPopup = ({
    notifications,
    handleAccept,
    handleDecline,
    onClose,
}) => {
    // const [showNotification, setShowNotification] = useState(false);

    // onClose=() => setShowNotification(false);

    return (
        <div className="z-[9999] ml-[5vh] h-[500px] overflow-y-scroll bg-[antiquewhite] shadow-[0_5px_5px_#717171]">
            {notifications.map((notification, index) => (
                <div key={index}>
                    <p>
                        <strong>Sender:</strong> {notification.sender}
                    </p>
                    <p>
                        <strong>Message:</strong> {notification.message}
                    </p>
                    <div>
                        <button
                            className="bg-[green] text-[15px] font-medium text-[white]"
                            onClick={() => handleAccept(index)}>
                            Accept
                        </button>
                        <button
                            className="ml-5 bg-[red] text-[15px] font-medium text-[white]"
                            onClick={() => handleDecline(index)}>
                            Decline
                        </button>
                    </div>
                </div>
            ))}
            <button
                className="rounded-[50%] bg-[blue] p-[5px] text-[white]"
                onClick={onClose}>
                Close
            </button>
        </div>
    );
};

export default NotificationPopup;
