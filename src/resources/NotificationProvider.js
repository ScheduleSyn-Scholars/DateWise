import { useUser } from './UserContext';
import { useEffect, useRef, useState } from 'react';
import { firestore } from './firebase';

// A react hook for accessing user notifications in realtime
const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const user = useUser();

    const initialRender = useRef(true);

    useEffect(() => {
        const unsubscribe = firestore
            .collection('users')
            .doc(user.uid)
            .collection('notifications')
            .onSnapshot((snapshot) => {
                const newNotifications = snapshot.docs.map((doc) => {
                    return {
                        notificationId: doc.id,
                        ...doc.data(),
                    };
                });

                // Sort notifications by timestamp
                newNotifications.sort((a, b) => {
                    let dateA = new Date(a.timeStamp),
                        dateB = new Date(b.timeStamp);
                    return dateA - dateB;
                });

                const oldNotificationIds = notifications.map(n => n.notificationId);
                const newNotification = newNotifications.find(n => !oldNotificationIds.includes(n.notificationId));
    
                if (newNotification && !initialRender.current) {
                    const notificationSound = new Audio('/pristine-609.mp3');
                    notificationSound.play().catch(error => {
                        console.log('Notification playback prevented', error);
                    });
                }

                if (initialRender.current) {
                    initialRender.current = false;
                }
                
                setNotifications(newNotifications);
            });

        return () => unsubscribe();
    }, [user]);

    return notifications;
};

export default useNotifications;
