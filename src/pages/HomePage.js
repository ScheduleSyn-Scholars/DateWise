import React, { useEffect, useState } from 'react';
import firebase from '../config/firebase';
import { Link } from 'react-router-dom';
import 'firebase/compat/firestore';
import { useUser } from './UserContext';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import CustomEventComponent from '../components/Calendar/CustomEvent';
import Header from '../components/Header.js';

const localizer = momentLocalizer(moment);

const HomePage = () => {
    const user = useUser();
    const [userCalendars, setUserCalendars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState([]);

    if (user.imageURL == null) {
        console.log('Printing from image addition My Profile');
        user.image = './Screenshot 2023-09-15 at 1.46 1.png';
    } else {
        user.image = user.imageURL;
    }

    useEffect(() => {
        const loadUserCalendars = async () => {
            try {
                const userUid = firebase.auth().currentUser.uid;
                const userDocRef = firebase
                    .firestore()
                    .collection('users')
                    .doc(userUid);

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

        const fetchEvents = async () => {
            try {
                const userUid = firebase.auth().currentUser.uid;
                const userDocRef = firebase
                    .firestore()
                    .collection('users')
                    .doc(userUid);

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
                        const calendarEvents = eventsSnapshot.docs.map(
                            (doc) => {
                                const data = doc.data();
                                const startDateTime = data.dateTime.toDate();
                                const formattedTime =
                                    startDateTime.toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    });
                                const title = `${calendar.calendarName}\n${formattedTime.replace(/\s+/g, '')}`;

                                return {
                                    ...data,
                                    id: doc.id,
                                    title: title,
                                    start: data.dateTime.toDate(), // Convert Timestamp to Date
                                    end: data.dateTime.toDate(), // Convert Timestamp to Date
                                };
                            },
                        );

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
    }, []);

    return (
        <div className="flex h-full w-full flex-col">
            <Header />
            <div class="flex h-fit w-full">
                <div className="items-center justify-center w-full border-r border-gray-500">
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        toolbar={true}
                        onSelectEvent={(event) => console.log(event)}
                        onSelectSlot={(slotInfo) => console.log(slotInfo)}
                        timezone="America/New_York"
                        components={{
                            event: CustomEventComponent,
                        }}
                    />
                </div>
        
                <div className="flex w-1/4 flex-col items-center justify-between">
                    <div className="text-2xl text-gray-700 font-bold mt-10">Shared Calendars</div>
                    {loading ? (
                        <p>Loading Calendars... </p>
                    ) : (
                        <div className="flex flex-col items-center overflow-y-scroll h-4/5">
                            {userCalendars.map((calendar) => (
                                <Link
                                    key={calendar.id}
                                    to={`/ViewCalendar/${calendar.id}/${encodeURIComponent(calendar.calendarName)}`}>
                                    <button className="mb-2 h-auto w-auto cursor-pointer rounded-[15px] border-[none] p-2 text-center font-times-new-roman text-2xl font-medium text-gray-800/60">
                                        {calendar.calendarName}
                                    </button>
                                </Link>
                            ))}
                        </div>
                    )}
                    
                    <Link to="/NewCalendar">
                        <button className="h-10 w-32 rounded-full border-none bg-green-800 text-white">
                            New Calendar
                        </button>
                    </Link>
                    <Link to="/">
                        <button className="mt-5 h-10 w-32 rounded-full border-none bg-gray-500 text-white">
                            Logout
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
