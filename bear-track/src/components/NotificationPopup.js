import React from "react";
import './NotificationPopup.css';

const NotificationPopup = ({message, onClose}) =>{
    return(
        <div className="notification-popup">
        <div className="notification-message">{message}</div>
        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </div>
    );
};

export default NotificationPopup;