import React, { useEffect, useState } from 'react';
import { firestore } from '../resources/firebase.js';
import { Link } from 'react-router-dom';
import 'firebase/compat/firestore';
import { useUser } from '../resources/UserContext.js';
import Header from '../components/Header.js';
import NewCalendarModal from '../components/NewCalendar.js';
import BigCalendar from '../components/BigCalendar.js';


const HomePage = () => {
    const user = useUser();
    const [calendars, setUserCalendars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const userDocRef = firestore.collection('users').doc(user.uid);
                const userDoc = await userDocRef.get();

                if (!userDoc.exists) {
                    throw new Error('User doc does not exist.');
                }

                const userData = userDoc.data();
                const calendars = userData.calendars || [];
                setUserCalendars(calendars);

                let allEvents = [];
                for (const calendar of calendars) {
                    const eventsRef = firestore
                        .collection('calendars')
                        .doc(calendar.id)
                        .collection('events');
                    const eventsSnapshot = await eventsRef.get();

                    for (const doc of eventsSnapshot.docs) {
                        const docData = doc.data();
                        const startDateTime = docData.dateTime.toDate();
                        const formattedTime = startDateTime.toLocaleTimeString(
                            [],
                            {
                                hour: '2-digit',
                                minute: '2-digit',
                            },
                        );
                        const title = `${calendar.calendarName}\n${formattedTime.replace(/\s+/g, '')}`;
                        // Only add the event if the user is attending the event
                        if (docData.attendees.includes(user.uid)) {
                            allEvents = [
                                ...allEvents,
                                {
                                    ...docData,
                                    id: doc.id,
                                    title: title,
                                    start: docData.dateTime.toDate(),
                                    end: docData.dateTime.toDate(),
                                    calendarId: calendar.id,
                                    calendarName: calendar.calendarName,
                                },
                            ];
                        }
                    }
                }
                setEvents(allEvents);
            } catch (error) {
                console.error('Error loading user calendars:', error);
            }
        };

        loadUserData();
        setLoading(false);
    }, [user]);

    const closeModalAndRefresh = () => {
        setIsOpen(false);
        window.location.reload(); // Refresh the page
    };

    return (
        <div className="flex flex-col h-screen">
            <Header />

            <div className="flex sm:h-fit h-full w-full">
                <div className="relative flex w-full sm:h-fit h-full sm:items-center justify-center sm:border-r sm:border-gray-500">
                    <BigCalendar events={events} />
                    
                </div>

                <div className="sm:flex flex-col w-1/4 items-center justify-between hidden">
                    <div className="mt-10 text-2xl font-bold text-gray-700">
                        Shared Calendars
                    </div>
                    {loading ? (
                        <p>Loading Calendars... </p>
                    ) : (
                        <div className="flex flex-col items-center h-4/5 overflow-y-auto">
                            {calendars.map((calendar) => (
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

                    <NewCalendarModal isOpen={isOpen} setIsOpen={setIsOpen} closeModalAndRefresh={closeModalAndRefresh} />
                    <Link to="/">
                        <button className="btn bg-red-400 text-white mt-5">
                            Logout
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HomePage;

