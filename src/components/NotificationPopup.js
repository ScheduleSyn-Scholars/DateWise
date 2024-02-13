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
        <div className="bg-[antiquewhite] shadow-[0_5px_5px_#717171] z-[9999] overflow-y-scroll h-[500px] ml-[5vh]">
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
                            className="bg-[green] text-[white] text-[15px] font-medium"
                            onClick={() => handleAccept(index)}>
                            Accept
                        </button>
                        <button
                            className="bg-[red] text-[white] text-[15px] font-medium ml-5"
                            onClick={() => handleDecline(index)}>
                            Decline
                        </button>
                    </div>
                </div>
            ))}
            <button className="bg-[blue] text-[white] p-[5px] rounded-[50%]" onClick={onClose}>
                Close
            </button>
        </div>
    );
};

export default NotificationPopup;
