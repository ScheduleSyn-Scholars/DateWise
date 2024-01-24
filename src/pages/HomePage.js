import React, { useContext, useEffect, useState } from 'react';
import './HomePage.css';
import firebase from '../config/firebase';
import { Link } from 'react-router-dom';
import BellIcon from '../components/bell-filled.svg';
import 'firebase/compat/firestore';
import { useUser } from './UserContext';
import NotificationPopup from '../components/NotificationPopup';
import { NotificationsContext } from '../components/NotificationsContext';
import {Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import CustomEventComponent from '../components/Calendar/CustomEvent';

const localizer = momentLocalizer(moment);


const HomePage = () => {
  const [image, setImage] = useState("");
  const user = useUser();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationCount, setNotificationCount] = useState();
  const [userCalendars, setUserCalendars] = useState([]);
  const accepted = true;
  const [ notificationsData, setNotificationsData ] = useState([]);

  const [notifyID, setNotifyID] = useState(''); 
  const[loading, setLoading] = useState(true);

  const [notificationCountReset, setNotificationCountReset] = useState(false);

  const { notifications, handleAccept, handleDecline } = useContext(NotificationsContext);
  
  const [events, setEvents] = useState([]);

  if (user.imageURL == null){
    console.log("Printing from image addition My Profile")
    user.image = './Screenshot 2023-09-15 at 1.46 1.png';
  } else{
    user.image = user.imageURL;
    //console.log("Printing from successful image addition My Profile: ", user.imageURL)

  }

  

//   useEffect(() => {

  

// }, [notificationCount]);

useEffect(() => {
  const loadUserCalendars = async () => {
    try {
      const userUid = firebase.auth().currentUser.uid;
      const userDocRef = firebase.firestore().collection('users').doc(userUid);

      const userDoc = await userDocRef.get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        const calendars = userData.calendars || []; // Assuming calendars is an array in user's document
        setUserCalendars(calendars);


      }
      setLoading(false);

    } catch (error) {
      console.error('Error loading user calendars:', error);
    }
  };

  loadUserCalendars();

  console.log('Notification Count after reset: ', notificationCount);
  const fetchEvents = async () => {
    try {
      const userUid = firebase.auth().currentUser.uid;
      const userDocRef = firebase.firestore().collection('users').doc(userUid);

      const userDoc = await userDocRef.get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        const calendars = userData.calendars || [];

        const eventsPromises = calendars.map(async (calendar) => {
          const eventsRef = firebase
            .firestore()
            .collection('calendars')
            .doc(calendar.id)
            .collection('events');

          const eventsSnapshot = await eventsRef.get();
          const calendarEvents = eventsSnapshot.docs.map((doc) => {
            const data = doc.data();
            const startDateTime = data.dateTime.toDate();
const formattedTime = startDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const title = `${calendar.calendarName}\n${formattedTime.replace(/\s+/g, '')}`;

            return {
              ...data,
              id: doc.id,
              title: title,
              start: data.dateTime.toDate(), // Convert Timestamp to Date
              end: data.dateTime.toDate(),   // Convert Timestamp to Date
            };
          });

          return calendarEvents;
        });

        const allEvents = await Promise.all(eventsPromises);
        const flattenedEvents = [].concat(...allEvents);

        setEvents(flattenedEvents);
      }
    } catch (error) {
      console.error('Error loading user calendars:', error);
    }
  };

  fetchEvents();
}, [notificationCount]); 




const loadUserNotifications = async (userUid) => {
  try {
    const firestore = firebase.firestore();
    const notificationRef = firestore.collection('Notification-Data');
    const notificationSnapshot = await notificationRef
      .where('receiver', '==', userUid)
      .get();
    const notificationsData = notificationSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    processNotifications(notificationsData);
    console.log("notifications Data: ", notificationsData)
    console.log('Notification count after loading: ', notificationCount);
  } catch (error) {
    console.error('Error loading user notifications:', error);
  }
};


const handleBellIconClick = async () => {
  try {
    // const notificationsSnapshot = await firebase
    //   .firestore()
    //   .collection('Notification-Data')
    //   .where('receiver', '==', user.uid)
    //   .get();

    setNotificationCountReset(true); // Setting the flag for notification count reset
    setNotificationCount(0, () =>{
      console.log('Notification Count after reset: ', notificationCount);
    }); // Resetting the notification count to zero
    console.log('Fetching notifications...');
    await loadUserNotifications(user.uid);
     //setNotificationMessage('You have new notifications!');


    console.log("Bell Clicked")
    console.log('Show notification:', showNotification);
    if (notificationCount > 0) {
      setNotificationMessage('You have new notifications!');
      setShowNotification(true);
    } else {
      setShowNotification(false);
    }
    //setShowNotification(true);

    }catch(error){
      console.error('Error loading notifications: ', error);
    }
  };
  

  const processNotifications = (notificationsData) =>{
    const notificationCountTemp = notificationsData.length;
    console.log('amount of notifications processing: ', notificationCountTemp);
    setNotificationCount(notificationCountTemp);
    notificationsData.forEach(async (notification) => {

      const inviteMessage  = `${notificationsData[0].sender} has sended an invitation for you to accept this certain meeting time and join "${notificationsData[0].calendarId}".`;

      setNotificationMessage(inviteMessage);

      setShowNotification(true);
      const notificationId = notification.id;
      const calendarId = notification.calendarId;

      //Render a Notification Popup for each notification
      setNotifyID(notificationId);
      setNotificationMessage(inviteMessage);
      setShowNotification(true);
   });
      
    
  };


  

  return (
    <div className="homepage">
      <div className='bell'><img src={BellIcon} onClick={handleBellIconClick}/>
        {notificationCount > 0 && (
          <div className='notification-count'>{notificationCount}</div>
        )}
      </div>
      {showNotification && (
        // <NotificationPopup 
        // message = {notificationMessage}
        // onClose={() => setShowNotification(false)}
        // />
        <NotificationPopup
        notifications={notifications}
        handleAccept={handleAccept}
        handleDecline={handleDecline}
        onClose={() => setShowNotification(false)}
      />
      )}
      <h1>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; </h1>
  
      <div className="left-panel"></div>
      <div className="logo-photo">
        <img src="./logo.png" alt="Grizzly Bear face" />
        <div className="titleStyle">DateWise</div>
      </div>
      <Link to="/MyProfile">
        <div>
          <img alt="User profile" src={user.image} className="user-photo" />
        </div>
      </Link>

      <div className="profileName">{user.userName}</div>

      <Link to="/">
        <button className="logout-button">Logout</button>
      </Link>

      <div className="center-panel">
        <Calendar 
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        toolbar={true}
        onSelectEvent={event => console.log(event)}
        onSelectSlot={slotInfo => console.log(slotInfo)}
        timezone="America/New_York"
        components={{
          event: CustomEventComponent,
        }}
        />

      </div>

      <div className = "right-panel">
        <div className = "calendarName">Mutual Calendars</div>
        {loading ? (
          <p>Loading Calendars... </p>
        ) : (<div className="user-calendars">
        {userCalendars.map((calendar) => (
          <Link
            key={calendar.id}
            to={`/ViewCalendar/${calendar.id}/${encodeURIComponent(calendar.calendarName)}`} 
            className="calendar-link">
              <button className="mutual-calendar-button">{calendar.calendarName}</button>
            </Link>
          ))}
        </div>
        )}
        

        <Link to="/NewCalendar">
          <button className="new-calendar-button">New Calendar</button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;