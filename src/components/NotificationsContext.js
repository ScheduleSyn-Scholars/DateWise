import React, { createContext, useState, useEffect, useMemo } from 'react';
import firebase from '../config/firebase'; // Import your firebase.js file
import 'firebase/compat/firestore';

const NotificationsContext = createContext();

const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [userCalendars, setUserCalendars] = useState([]);
  const [notificationId, setNotificationId] = useState('');
  // const [calendarName, setCalendarName] = useState('');

  const userUid = firebase.auth().currentUser?.uid;
  const firestore = firebase.firestore();

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const notificationRef = firestore.collection('Notification-Data');
        const notificationSnapshot = await notificationRef
          .where('receiver', '==', userUid)
          .get();
        const notificationsData = notificationSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setNotifications(notificationsData);
      } catch (error) {
        console.error('Error loading user notifications:', error);
      }
    };

    if (userUid) {
      loadNotifications();
    }
  }, [firestore, userUid]);

  const handleAccept = async (index) => {
    try {
      setNotificationId(notifications[index].id)
      console.log('NotificationID: ', notificationId)

      const notificationRef = firestore.collection('Notification-Data').doc(notificationId);
      const notificationDataDoc = await notificationRef.get();

      if (notificationDataDoc.exists) {
        const { calendarId } = notificationDataDoc.data();
        console.log('calendarId:   ', calendarId);
        await notificationRef.update({ decision: true });

        await notificationRef.delete();

        const userUid = firebase.auth().currentUser.uid;
        const userDocRef = firestore.collection('users').doc(userUid);

        const userDoc = await userDocRef.get();
        if (userDoc.exists) {
          const userData = userDoc.data();

          if (!userData.hasOwnProperty('calendars')) {
            await userDocRef.set({ calendars: [] }, { merge: true });
          }

          const calendarRef = firestore.collection('calendars').doc(calendarId)
          const calendarDataDoc = await calendarRef.get();
          if (calendarDataDoc.exists) {
            const { calendarName } = calendarDataDoc.data();

            // setCalendarName(cName);
            let updatedCalendars = userData.calendars || [];
            updatedCalendars.push({ id: calendarId, calendarName: calendarName });
            await userDocRef.update({ calendars: updatedCalendars });
            setUserCalendars(updatedCalendars);

            console.log('Caleeeendddaaarrrr Nammmmmmeeeee: ', calendarName)
            console.log('Calendar Name:', calendarName);
          }
          else {
            console.log('Calendar does not Exist');
          }

          //navigate(`/ViewCalendar/${calendarId}`);
          //window.location.href = `/ViewCalendar/${calendarId}`;
          const updatedNotifications = [...notifications];
          updatedNotifications.splice(index, 1);
          setNotifications(updatedNotifications);
        }
      }
    } catch (error) {
      console.error('Error handling accept: ', error);
    }
  };

  const handleDecline = async (index) => {
    const userUid = firebase.auth().currentUser.uid;

    console.log("Index: ", index);
    console.log("Notif ID:   ", notifications[index].id)
    try {
      setNotificationId(notifications[index].id)
      console.log('NotificationID: ', notificationId)

      const calendarId = notifications[index].calendarId;
      await handleNotificationInteraction(notificationId, calendarId, false, userCalendars);
      await firestore.collection('Notification-Data').doc(notificationId).delete();

      await firestore.collection('calendars').doc(calendarId).update({
        ['users']: firebase.firestore.FieldValue.arrayRemove(userUid)
      })
        .then(() => {
          console.log('Value removed from array successfully.');
        })
        .catch((error) => {
          console.error('Error removing value from array: ', error);
        });



      const updatedNotifications = [...notifications];
      updatedNotifications.splice(index, 1);
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error('Error deleting notification: ', error);
    }

  };

  const handleNotificationInteraction = async (notificationId, calendarId, accepted) => {
    try {
      const userUid = firebase.auth().currentUser.uid;
      await firebase.firestore().collection('Notification-Data').doc(notificationId).update({ decision: accepted });

      const userDoc = await firestore.collection('users').doc(userUid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();

        if (accepted) {
          // Additional logic for accepted invitation
          await firestore.collection('users').doc(userUid).update({ status: 'Attending' });
          const calendarDoc = await firestore.collection("calendars").doc(calendarId).get();
          const calendarTitle = calendarDoc.data().calendarTitle;
          const updatedCalendars = [...userCalendars, { id: calendarId, calendarName: calendarTitle }];
          setUserCalendars(updatedCalendars);
          window.location.href = `/ViewCalendar/${calendarId}`;
        } else {
          // Additional logic for declined invitation
          await firestore.collection('users').doc(userUid).update({ status: 'Not Attending' });
          await firestore.collection('Notification-Data').doc(notificationId).delete();
        }
      }
    } catch (error) {
      console.error('Error in handling notification interaction:', error);
    }
  };

  const contextValue = useMemo(() => ({
    notifications,
    handleAccept,
    handleDecline,
  }), [notifications, handleAccept, handleDecline]);

  return (
    <NotificationsContext.Provider value={contextValue}>
      {children}
    </NotificationsContext.Provider>
  );
};

export { NotificationsContext, NotificationsProvider };

