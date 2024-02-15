import React, { useContext, useEffect, useState } from 'react';
import firebase from '../config/firebase';
import { Link } from 'react-router-dom';
import BellIcon from '../components/bell-filled.svg';
import 'firebase/compat/firestore';
import { useUser } from './UserContext';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import CustomEventComponent from '../components/Calendar/CustomEvent';

const localizer = momentLocalizer(moment);

const HomePage = () => {
    const [image, setImage] = useState('');
    const user = useUser();
    const [userCalendars, setUserCalendars] = useState([]);
    const accepted = true;

    const [loading, setLoading] = useState(true);

    const [events, setEvents] = useState([]);

    if (user.imageURL == null) {
        console.log('Printing from image addition My Profile');
        user.image = './Screenshot 2023-09-15 at 1.46 1.png';
    } else {
        user.image = user.imageURL;
        //console.log("Printing from successful image addition My Profile: ", user.imageURL)
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
            } catch (error) {
                console.error('Error loading user calendars:', error);
            }
        };

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
        loadUserCalendars();
        fetchEvents();
        setLoading(false);

    }, []);

    

    return (
        <div className="flex h-full w-full flex-row">
            <div className="top-36 flex h-full w-1/4 flex-col items-center justify-center space-y-4 text-center">
                <img
                    className="h-36 w-44 overflow-hidden rounded-[40%] shadow-[0px_0px_0px_rgba(0,0,0,0.25)]"
                    src="Logo.png"
                    alt="Grizzly Bear face"
                />
                <div className="-ml-8 mt-2 font-times-new-roman text-5xl text-green-800">
                    DateWise
                </div>
                <Link to="/MyProfile">
                    <div>
                        <img
                            alt="User profile"
                            src={user.image}
                            className="mt-2 h-[180px] w-[180px] rounded-[80%] bg-[#ccc]"
                        />
                    </div>
                </Link>
                <div className="font-times-new-roman text-3xl text-[#666666]">
                    {user.userName}
                </div>

                <Link to="/">
                    <button className="left-[100px] top-[735px] mb-6 h-[35px] w-[150px] cursor-pointer rounded-[15px] border-[none] bg-[#ff0000] p-2.5 text-xl leading-[10px] text-white hover:cursor-pointer hover:rounded-[15px] hover:border-[none] hover:bg-[#dd0000] hover:text-white">
                        Logout
                    </button>
                </Link>
            </div>

            <div className="h-4/5 w-1/2 bg-[white] shadow-[0_0_20px_rgba(0,0,0,0)]">
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

            <div className="w-1/4 border-l-2 border-solid border-gray-700 bg-white">
                <div className="ml-0 mt-5 text-center font-times-new-roman text-[25px] font-medium text-[#696969]">
                    Mutual Calendars
                </div>
                {loading ? (
                    <p>Loading Calendars... </p>
                ) : (
                    <div className="ml-[4vh] flex h-[600px] flex-col items-center overflow-y-scroll">
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
            </div>
        </div>
    );
};

export default HomePage;
