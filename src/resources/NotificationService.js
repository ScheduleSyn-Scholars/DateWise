import { firestore } from './firebase';

/**
 * Invites a user to a calendar that exists in the firestore
 * @param sender The current user object from useUser()
 * @param targetEmail the email for the user being sent the notification
 * @param calendarId calendar doc id
 */
export const sendCalendarInvite = async (sender, targetEmail, calendarId) => {
    try {
        const query = firestore
            .collection('users')
            .where('email', '==', targetEmail);
        const querySnapshot = await query.get();
        const targetUserDoc = querySnapshot.docs[0];

        // get the calendar data
        const calendarDocRef = firestore
            .collection('calendars')
            .doc(calendarId)
        const calendarDoc = await calendarDocRef.get();
        const calendarData = calendarDoc.data();

        // Build the notification to be sent to user
        const newNotification = {
            timeStamp: new Date().toLocaleString(),
            fromUid: sender.uid,
            fromName: `${sender.firstName} ${sender.lastName}`,
            calendarId: calendarId,
            calendarName: calendarData.calendarName,
        };

        await firestore
            .collection('users')
            .doc(targetUserDoc.id)
            .collection('notifications')
            .add(newNotification);
    } catch (error) {
        console.error(`Error sending calendar invite: ${error}`);
    }
};

/**
 * Invites a user to an event that exists in the firestore
 * @param sender The current user object from useUser()
 * @param targetEmail
 * @param calendarId
 * @param eventId
 */
export const sendEventInvite = async (
    sender,
    targetEmail,
    calendarId,
    eventId,
) => {
    try {
        const query = firestore
            .collection('users')
            .where('email', '==', targetEmail);
        const querySnapshot = await query.get();
        const targetUserDoc = querySnapshot.docs[0];

        // Get calendar doc and data
        const calendarDocRef = firestore
            .collection('calendars')
            .doc(calendarId);
        const calendarDoc = await calendarDocRef.get();
        const calendarData = calendarDoc.data();

        // get event data
        const eventDocRef = calendarDocRef.collection('events').doc(eventId);
        const eventDoc = await eventDocRef.get();
        const eventData = eventDoc.data();

        // Build the notification to be sent to user
        const newNotification = {
            timeStamp: new Date().toLocaleString(),
            fromUid: sender.uid,
            fromName: `${sender.firstName} ${sender.lastName}`,
            calendarId: calendarId,
            eventId: eventId,
            dateTime: eventData.dateTime,
            calendarName: calendarData.calendarName,
            eventName: eventData.name,
        };

        // Add the notification to the user's notification collection
        await firestore
            .collection('users')
            .doc(targetUserDoc.id)
            .collection('notifications')
            .add(newNotification);
    } catch (error) {
        console.error(`Error sending event invite: ${error}`);
    }
};


/**
 * Function for adding a message to notifications
 */
export const sendMessageNotification = async (targetEmail, message) => {
    try {
        console.log(`Sending message notification to ${targetEmail}`);

        const query = firestore
            .collection('users')
            .where('email', '==', targetEmail);
        const querySnapshot = await query.get();
        const targetUserDoc = querySnapshot.docs[0];

        // Build message notification
        const newNotification = {
            timeStamp: new Date().toLocaleString(),
            message,
        };

        await firestore
            .collection('users')
            .doc(targetUserDoc.id)
            .collection('notifications')
            .add(newNotification);
    } catch (error) {
        console.error(`Error sending message notification: ${error}`);
    }
};
