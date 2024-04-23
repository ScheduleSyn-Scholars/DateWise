import CustomEventComponent from './Calendar/CustomEvent';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { ReactComponent as XIcon } from './x-icon.svg';
import { firestore } from '../resources/firebase';
import { useUser } from '../resources/UserContext';
import firebase from 'firebase/compat/app';
import { useNavigate } from 'react-router-dom';

const localizer = momentLocalizer(moment);

const BigCalendar = (props) => {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
    const popupRef = useRef(null);

    const user = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                popupRef.current &&
                selectedEvent &&
                !popupRef.current.contains(event.target)
            ) {
                handleClosePopup();
            }
        };

        props.events.sort((a, b) => {
            return a.dateTime.seconds - b.dateTime.seconds;
        });

        setEvents(props.events);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [props.events, popupPosition, selectedEvent]);

    const handleSelectEvent = (event, e) => {
        const eventRect = e.target.getBoundingClientRect();
        const middleLine = window.innerHeight / 2;

        let top;
        if (eventRect.top < middleLine) {
            top = eventRect.bottom - 75;
        } else {
            top = eventRect.top - 425;
        }

        setPopupPosition({
            top: top,
            left: eventRect.left - eventRect.width / 2,
        });
        setSelectedEvent(event);
    };

    const handleClosePopup = () => {
        setSelectedEvent(null);
    };

    const leaveEvent = async (event) => {
        const confirmedLeave = window.confirm(
            `Would you like to stop attending ${event.title}?`,
        );
        // Remove the current user from the event attendees
        if (confirmedLeave) {
            const eventDocRef = firestore
                .collection('calendars')
                .doc(event.calendarId)
                .collection('events')
                .doc(event.id);
            await eventDocRef.update({
                attendees: firebase.firestore.FieldValue.arrayRemove(user.uid),
            });
        }
    };

    const goToCalendar = (event) => {
        navigate(
            `/ViewCalendar/${event.calendarId}/${encodeURIComponent(event.calendarName)}`,
        );
    };

    return (
        <div>
            {/** Desktop View */}
            <div className="hidden sm:flex">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    toolbar={true}
                    onSelectEvent={handleSelectEvent}
                    timezone="America/New_York"
                    components={{
                        event: CustomEventComponent,
                    }}
                />
                {selectedEvent && (
                    <div
                        style={{
                            top: `${popupPosition.top}px`,
                            left: `${popupPosition.left}px`,
                        }}
                        className="border-1 absolute z-[99999] flex w-64 flex-col items-center justify-center rounded-2xl border-gray-800 bg-gray-200 p-3 shadow-2xl"
                        ref={popupRef}>
                        <div className="top-0 flex w-full items-center">
                            <div className="flex-grow text-center text-2xl font-bold">
                                <h1>Event Details</h1>
                            </div>
                            <button
                                className="btn btn-ghost float-right rounded-full"
                                onClick={handleClosePopup}>
                                <XIcon className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="table font-times-new-roman text-sm">
                                <tbody>
                                    <tr>
                                        <th>Calendar</th>
                                        <td>{selectedEvent.name}</td>
                                    </tr>
                                    <tr>
                                        <th>Date</th>
                                        <td>
                                            {new Date(
                                                selectedEvent.start,
                                            ).toLocaleDateString()}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Time</th>
                                        <td>
                                            {new Date(
                                                selectedEvent.start,
                                            ).toLocaleTimeString()}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Description</th>
                                        <td>{selectedEvent.description}</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <button
                                                className="btn bg-green-800 text-white"
                                                onClick={() => {
                                                    goToCalendar(selectedEvent);
                                                }}>
                                                Go To Calendar
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                className="btn bg-red-500 text-white"
                                                onClick={() => {
                                                    leaveEvent(selectedEvent);
                                                }}>
                                                Leave Event
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
            {/** Mobile View */}
            <div className="flex h-full w-screen flex-col space-y-2 p-2 sm:hidden">
                <div className="divider divider-start font-times-new-roman text-xl font-bold">
                    Upcoming Events
                </div>
                {events.map((event, index) => {
                    return (
                        event.start > new Date() && (
                            <div
                                key={index}
                                className="border-1 collapse collapse-arrow rounded-2xl border-gray-800 bg-gray-200 p-3 shadow-2xl">
                                <input type="radio" name="my-accordion-1" />
                                <div className="collapse-title flex items-center justify-center text-xl font-medium">
                                    {event.name} -{' '}
                                    {new Date(event.start).toLocaleDateString()}
                                </div>
                                <div className="collapse-content flex items-center justify-center">
                                    <div className="overflow-x-auto">
                                        <table className="table font-times-new-roman text-xl">
                                            <tbody>
                                                <tr>
                                                    <th>Date</th>
                                                    <td>
                                                        {new Date(
                                                            event.start,
                                                        ).toDateString()}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th>Time</th>
                                                    <td>
                                                        {new Date(
                                                            event.start,
                                                        ).toLocaleTimeString()}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th>Description</th>
                                                    <td>{event.description}</td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <button
                                                            className="btn bg-green-800 text-white"
                                                            onClick={() =>
                                                                goToCalendar(
                                                                    event,
                                                                )
                                                            }>
                                                            Go To Calendar
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn bg-red-500 text-white"
                                                            onClick={() =>
                                                                leaveEvent(
                                                                    event,
                                                                )
                                                            }>
                                                            Leave Event
                                                        </button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )
                    );
                })}
            </div>
        </div>
    );
};

export default BigCalendar;
