import React, { useEffect, useState } from 'react';
import { firestore } from '../resources/firebase.js';
import { Link, useNavigate } from 'react-router-dom';
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

    const navigate = useNavigate();

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
                                    description: docData.description || '',
                                },
                            ];
                        }
                    }
                }

                //Enable only current dated events
                // const currentDate = new Date();
                // const currentEvents = allEvents.filter(event => {
                //     // Checks if the event's end date is after today's date
                //     return new Date(event.end) >= currentDate;
                // });

                setEvents(allEvents);
            } catch (error) {
                console.error('Error loading user calendars:', error);
            }
        };

        //loadUserData();
        loadUserData().then(() => setLoading(false));
        //setLoading(false);
    }, [user]);

    const closeModalAndRefresh = () => {
        setIsOpen(false);
        window.location.reload(); // Refresh the page
    };

    if (!user) {
        navigate('/');
        return null;
    }

    return (
        <div className="flex h-screen flex-col">
            <Header />

            <div className="flex h-full w-full flex-col sm:h-fit sm:flex-row">
                <div className="relative flex h-full w-full justify-center sm:h-fit sm:items-center sm:border-r sm:border-gray-500">
                    <BigCalendar events={events} />
                </div>

                <div className="w-full flex-col items-center justify-between p-2 sm:flex sm:w-1/4 sm:p-0">
                    <div className="mt-10 hidden text-2xl font-bold text-gray-700 sm:block">
                        Shared Calendars
                    </div>
                    <div className="divider divider-start font-times-new-roman text-xl font-bold sm:hidden">
                        Calendars
                    </div>
                    {loading ? (
                        <p>Loading Calendars... </p>
                    ) : (
                        <div className="flex flex-col space-y-2 overflow-y-auto p-2 sm:h-4/5 sm:w-auto sm:items-center">
                            {calendars.map((calendar) => (
                                <Link
                                    key={calendar.id}
                                    to={`/ViewCalendar/${calendar.id}/${encodeURIComponent(calendar.calendarName)}`}>
                                    <button className="btn w-full bg-green-800 font-sans text-lg text-white shadow-md sm:btn-ghost sm:w-auto sm:text-xl sm:text-gray-500">
                                        {calendar.calendarName}
                                    </button>
                                </Link>
                            ))}
                        </div>
                    )}
                    <div className="flex w-full justify-end p-2 sm:justify-start sm:justify-center sm:p-0">
                        <NewCalendarModal
                            isOpen={isOpen}
                            setIsOpen={setIsOpen}
                            closeModalAndRefresh={closeModalAndRefresh}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
