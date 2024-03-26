import useNotifications from '../resources/NotificationProvider';
import { useUser } from '../resources/UserContext';
import { firestore } from '../resources/firebase';
import { ReactComponent as BellIcon } from './bell-filled.svg';
import { useNavigate } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import { useEffect, useRef, useState } from 'react';
import { sendMessageNotification } from '../resources/NotificationService';

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleRef = useRef(null);
    const dropdownRef = useRef(null);

    const notifications = useNotifications();
    const user = useUser();
    const navigate = useNavigate();

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                !toggleRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const acceptNotification = async (notification) => {
        try {
            switch (notification.notificationType) {
                case 'message:':
                    await deleteNotification(notification);
                    break;
                case 'event':
                    // Add the user to the event attendees
                    const eventDocRef = firestore
                        .collection('calendars')
                        .doc(notification.calendarId)
                        .collection('events')
                        .doc(notification.eventId);
                    eventDocRef.update({
                        attendees: firebase.firestore.FieldValue.arrayUnion(
                            user.uid,
                        ),
                    });
                    await deleteNotification(notification);
                    break;
                case 'calendar':
                    // Add the user to the calendar
                    const docRef = firestore
                        .collection('calendars')
                        .doc(notification.calendarId);
                    docRef.update({
                        users: firebase.firestore.FieldValue.arrayUnion(
                            user.uid,
                        ),
                    });

                    // Adds the calendar to the users calendars
                    const userDocRef = firestore
                        .collection('users')
                        .doc(user.uid);
                    userDocRef.update({
                        calendars: firebase.firestore.FieldValue.arrayUnion({
                            calendarName: notification.calendarName,
                            id: notification.calendarId,
                        }),
                    });
                    await deleteNotification(notification);
                    break;
                default:
                    console.error('Notification type is not set.');
            }

            // If relevant, navigate to the calendar page
            if (
                notification.notificationType === 'event' ||
                notification.notificationType === 'calendar'
            ) {
                navigate(
                    `/ViewCalendar/${notification.calendarId}/${encodeURIComponent(notification.calendarName)}`,
                );
            }
        } catch (error) {
            console.error('Error accepting notification.', error);
        }
    };

    const declineNotification = async (notification) => {
        try {
            switch (notification.notificationType) {
                case 'message':
                    await deleteNotification(notification);
                    break;
                case 'calendar':
                    await sendMessageNotification(
                        user,
                        notification.fromEmail,
                        `${user.firstName} ${user.lastName} has declined your invite to ${notification.calendarName}`,
                    );
                    await deleteNotification(notification);
                    break;
                case 'event':
                    await sendMessageNotification(
                        user,
                        notification.fromEmail,
                        `${user.firstName} ${user.lastName} has declined your invite to ${notification.eventName}`,
                    );
                    await deleteNotification(notification);
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.error('Error declining notification.', error);
        }
    };

    const deleteNotification = async (notification) => {
        try {
            await firestore
                .collection('users')
                .doc(user.uid)
                .collection('notifications')
                .doc(notification.notificationId)
                .delete();
        } catch (error) {
            console.error(`Error removing notification: ${error}`);
        }
    };

    if (notifications.length === 0) {
        return (
            <div className="dropdown dropdown-end">
                <BellIcon
                    tabIndex="0"
                    role="button"
                    className="cursor-pointer"
                />
                <div className="dropdown-content z-[1] w-72 bg-neutral p-6 text-center font-bold text-primary-content shadow">
                    <p>No Notifications!</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="dropdown dropdown-end dropdown-bottom z-[9999999]"
            ref={dropdownRef}>
            <div
                ref={toggleRef}
                tabIndex={0}
                role="button"
                className="indicator"
                onClick={toggleDropdown}>
                <span className="badge indicator-item badge-secondary">
                    {notifications.length}
                </span>
                <BellIcon />
            </div>
            <ul
                tabIndex={0}
                className="dropdown-content w-96 space-y-1 rounded-xl bg-neutral p-2 text-black shadow">
                <p
                    className={`text-center text-xl text-white ${isOpen ? '' : 'hidden'}`}>
                    Notifications
                </p>
                {notifications.map((notification, index) => {
                    switch (notification.notificationType) {
                        case 'message':
                            return (
                                <div
                                    key={index}
                                    className={`collapse collapse-arrow bg-base-200 p-4 ${isOpen ? '' : 'hidden'}`}>
                                    <input type="radio" name="my-accordion-2" />
                                    <div className="collapse-title text-xl font-medium">
                                        {notification.message}
                                    </div>
                                    <div className="collapse-content">
                                        <div className="flex items-center justify-center">
                                            <button
                                                className="btn btn-info"
                                                onClick={() =>
                                                    declineNotification(
                                                        notification,
                                                    )
                                                }>
                                                Delete Notification
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        case 'calendar':
                            return (
                                <div
                                    key={index}
                                    className={`collapse collapse-arrow bg-base-200 p-4 ${isOpen ? '' : 'hidden'}`}>
                                    <input type="radio" name="my-accordion-2" />
                                    <div className="text-xk collapse-title font-medium">
                                        {notification.fromName} has invited you
                                        to join {notification.calendarName}
                                    </div>
                                    <div className="collapse-content">
                                        <div className="flex justify-center space-x-6">
                                            <button
                                                className="btn btn-primary"
                                                onClick={() =>
                                                    acceptNotification(
                                                        notification,
                                                    )
                                                }>
                                                Accept
                                            </button>
                                            <button
                                                className="btn btn-error"
                                                onClick={() =>
                                                    declineNotification(
                                                        notification,
                                                    )
                                                }>
                                                Decline
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        case 'event':
                            return (
                                <div
                                    key={index}
                                    className={`collapse collapse-arrow bg-base-200 p-4 ${isOpen ? '' : 'hidden'}`}>
                                    <input type="radio" name="my-accordion-2" />
                                    <div className="collapse-title text-xl font-medium">
                                        {notification.fromName} has invited you
                                        to an event!
                                    </div>
                                    <div className="collapse-content flex flex-col items-center justify-center">
                                        <p>
                                            Calendar:{' '}
                                            {notification.calendarName}
                                        </p>
                                        <p>Event: {notification.eventName}</p>
                                        <p>
                                            Time:{' '}
                                            {notification.dateTime
                                                .toDate()
                                                .toLocaleString()}
                                        </p>
                                        <div className="flex justify-center space-x-6">
                                            <button
                                                className="btn btn-primary"
                                                onClick={() =>
                                                    acceptNotification(
                                                        notification,
                                                    )
                                                }>
                                                Accept
                                            </button>
                                            <button
                                                className="btn btn-error"
                                                onClick={() =>
                                                    declineNotification(
                                                        notification,
                                                    )
                                                }>
                                                Decline
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        default:
                            return null;
                    }
                })}
            </ul>
        </div>
    );
};

export default NotificationBell;
