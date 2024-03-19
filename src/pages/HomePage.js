import React, { useEffect, useState } from 'react';
import { firestore } from '../resources/firebase.js';
import { Link } from 'react-router-dom';
import 'firebase/compat/firestore';
import { useUser } from '../resources/UserContext.js';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import CustomEventComponent from '../components/Calendar/CustomEvent';
import Header from '../components/Header.js';
import NewCalendarModal from '../components/NewCalendar.js';

const localizer = momentLocalizer(moment);

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
                        allEvents = [
                            ...allEvents,
                            {
                                ...docData,
                                id: doc.id,
                                title: title,
                                start: docData.dateTime.toDate(),
                                end: docData.dateTime.toDate(),
                            },
                        ];
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

            <div className="flex h-fit w-full">
                <div className="hidden md:flex w-full h-fit items-center justify-center border-r border-gray-500">

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

                <div className="flex flex-col w-1/4 items-center justify-between">
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

