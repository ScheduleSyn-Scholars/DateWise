import NotificationBell from '../components/NotificationBell';
import {
    sendCalendarInvite,
    sendEventInvite,
    sendMessageNotification,
} from '../resources/NotificationService';
import { useUser } from '../resources/UserContext';
import { firestore } from '../resources/firebase';

//todo remove this when done testing
const ComponentTestPage = () => {
    const user = useUser();
    const addMessageNotification = async () => {
        await sendMessageNotification(
            user.email,
            'This is a sample notification!',
        );
    };
    const addCalendarInvite = async () => {
        await sendCalendarInvite(user, user.email, '0efKoaO9nSiuiOhQ3K8H');
    };
    const addEventInvite = async () => {
        await sendEventInvite(
            user,
            user.email,
            '2VJEqv8srm8Ju6BfZqkg',
            'XiUCt5JM4ruQKLpTithk',
        );
    };
    const removeNotifications = async () => {
        const userDocRef = firestore.collection('users').doc(user.uid);
        const notificationsRef = userDocRef.collection('notifications');

        const snapshot = await notificationsRef.get();
        const batch = firestore.batch();

        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();
    };
    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <NotificationBell />
            <div className="absolute left-0 top-0 flex space-x-4">
                <button
                    className="bg-green-500 p-10"
                    onClick={addMessageNotification}>
                    Add notification
                </button>
                <button
                    className="bg-green-500 p-10"
                    onClick={addCalendarInvite}>
                    Add Calendar Invite
                </button>
                <button className="bg-green-500 p-10" onClick={addEventInvite}>
                    Add Event Invite
                </button>
                <button
                    className="bg-red-500 p-10"
                    onClick={removeNotifications}>
                    Remove notifications
                </button>
            </div>
        </div>
    );
};

export default ComponentTestPage;
