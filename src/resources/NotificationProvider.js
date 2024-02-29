import { useUser } from './UserContext';
import { useEffect, useState } from 'react';
import { firestore } from './firebase';


// A react hook for accessing user notifications in realtime
const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const user = useUser();

    useEffect(() => {
        const unsubscribe = firestore.collection('users')
            .doc(user.uid)
            .collection('notifications')
            .onSnapshot(snapshot => {
                const newNotifications = snapshot.docs.map((doc) => {
                    return {
                        notificationId: doc.id,
                        ...doc.data(),
                    }
                });

                // Sort notifications by timestamp
                notifications.sort((a, b) => {
                    let dateA = new Date(a.timeStamp), dateB = new Date(b.timeStamp);
                    return dateA - dateB;
                });
                setNotifications(newNotifications);
            });

        return () => unsubscribe();
    }, [user]);

    return notifications;
}

export default useNotifications;