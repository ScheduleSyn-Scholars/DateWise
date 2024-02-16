import React, { useContext, useEffect, useState } from 'react';
import firebase from '../config/firebase';
import { Link } from 'react-router-dom';
import 'firebase/compat/firestore';
import { useUser } from './UserContext';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import CustomEventComponent from '../components/Calendar/CustomEvent';
import Header from '../components/Header';

const localizer = momentLocalizer(moment);

const HomePage = () => {
    const [image, setImage] = useState('');
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
        <div className="flex h-screen w-screen flex-row pt-32">
            <div className="w-70 flex grow">
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
            <div className="w-29 flex grow">
                <div className="">Mutual Calendars</div>
                {loading ? (
                    <p>Loading Calendars... </p>
                ) : (
                    <div className=" flex-col items-center overflow-y-scroll">
                        {userCalendars.map((calendar) => (
                            <Link
                                key={calendar.id}
                                to={`/ViewCalendar/${calendar.id}/${encodeURIComponent(calendar.calendarName)}`}>
                                <button className="mb-2 h-[35px] w-[150px] cursor-pointer rounded-[15px] border-[none] bg-[#0e724c] p-2.5 text-center font-times-new-roman text-xl font-medium text-[white]">
                                    {calendar.calendarName}
                                </button>
                            </Link>
                        ))}
                    </div>
                )}

                <Link to="/NewCalendar">
                    <button className="ml-[4vh] mt-[6vh] h-[35px] w-[150px] items-center justify-center rounded-[15px] border-[none] bg-[#0e724c] text-center font-times-new-roman text-xl font-medium text-[white] no-underline hover:bg-[#095c3e]">
                        New Calendar
                    </button>
                </Link>
                <Link to="/">
                    <button className="left-[100px] top-[735px] mb-6 h-[35px] w-[150px] cursor-pointer rounded-[15px] border-[none] bg-[#ff0000] p-2.5 text-xl leading-[10px] text-white hover:cursor-pointer hover:rounded-[15px] hover:border-[none] hover:bg-[#dd0000] hover:text-white">
                        Logout
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default HomePage;
