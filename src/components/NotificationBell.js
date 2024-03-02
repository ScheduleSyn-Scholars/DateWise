import useNotifications from '../resources/NotificationProvider';
import { useUser } from '../resources/UserContext';
import { firestore } from '../resources/firebase';
import { ReactComponent as BellIcon } from './bell-filled.svg';
import { useNavigate } from 'react-router-dom';
import firebase from 'firebase/compat/app';

const NotificationBell = () => {
    const notifications = useNotifications();
    const user = useUser();
    const navigate = useNavigate();

    const acceptNotification = async (notification) => {
        if (notification.message) {
            await deleteNotification(notification);
            return;
        }
        if (notification.eventId) {
            // Add the user to the event attendees
            const eventDocRef = firestore
                .collection('calendars')
                .doc(notification.calendarId)
                .collection('events')
                .doc(notification.eventId);
            eventDocRef.update({
                attendees: firebase.firestore.FieldValue.arrayUnion(user.uid),
            });
        } else if (notification.calendarId) {
            // Add the user to the calendar
            const docRef = firestore
                .collection('calendars')
                .doc(notification.calendarId);
            docRef.update({
                users: firebase.firestore.FieldValue.arrayUnion(user.uid),
            });

            // Adds the calendar to the users calendars
            const userDocRef = firestore.collection('users').doc(user.uid);
            userDocRef.update({
                calendars: firebase.firestore.FieldValue.arrayUnion({
                    calendarName: notification.calendarName,
                    id: notification.calendarId,
                }),
            });
        }
        // Delete the user's notification
        await deleteNotification(notification);
        navigate(
            `/ViewCalendar/${notification.calendarId}/${encodeURIComponent(notification.calendarName)}`,
        );
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
        <div className="dropdown dropdown-end indicator">
            <span className="badge indicator-item badge-secondary cursor-pointer">
                {notifications.length}
            </span>
            <BellIcon tabIndex="0" role="button" className="cursor-pointer" />
            <div className="dropdown-content z-[1] w-96 space-y-1 rounded bg-neutral p-2 text-black shadow">
                <p className="text-center text-xl text-white">Notifications</p>
                {notifications.map((notification, index) => (
                    <div
                        key={index}
                        className="collapse collapse-arrow bg-base-200 p-4">
                        <input type="radio" name="my-accordion-2" />
                        <div className="collapse-title text-xl font-medium">
                            {notification.message ||
                                notification.calendarName ||
                                notification.eventName}
                        </div>
                        <div className="collapse-content">
                            <div className="flex justify-center space-x-6">
                                <button
                                    className="btn btn-primary"
                                    onClick={() =>
                                        acceptNotification(notification)
                                    }>
                                    Accept
                                </button>
                                <button
                                    className="btn btn-error"
                                    onClick={() =>
                                        deleteNotification(notification)
                                    }>
                                    Decline
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotificationBell;
