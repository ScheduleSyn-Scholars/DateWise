import React, { useState } from 'react';

const add30Minutes = (time) => {
    const [hours, minutes] = time.split(':');
    let totalMinutes = parseInt(hours) * 60 + parseInt(minutes) + 30;

    // Ensure the total minutes is a multiple of 30
    totalMinutes = Math.ceil(totalMinutes / 30) * 30;

    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;

    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
};

const AvailabilityForm = ({ onAvailabilityChange }) => {
    const [selectedDays, setSelectedDays] = useState([]);
    const [times, setTimes] = useState({});

    const handleDayToggle = (day) => {
        const newSelectedDays = [...selectedDays];
        let newTimes = { ...times };

        if (newSelectedDays.includes(day)) {
            // Day is already selected, remove it
            newSelectedDays.splice(newSelectedDays.indexOf(day), 1);
            delete newTimes[day];
        } else {
            // Day is not selected, add it with default times
            newSelectedDays.push(day);
            newTimes = {
                ...newTimes,
                [day]: [{ start: '09:00', end: '17:00' }],
            };
        }

        setSelectedDays(newSelectedDays);
        setTimes(newTimes);
        onAvailabilityChange({
            selectedDays: newSelectedDays,
            times: newTimes,
        });
    };

    const handleTimeChange = (day, index, timeType, value) => {
        const newTimes = { ...times };
        newTimes[day][index][timeType] = value;
        setTimes(newTimes);
        onAvailabilityChange({ selectedDays, times });
    };

    const handleAddTimeSlot = (day) => {
        const newTimes = { ...times };
        newTimes[day] = newTimes[day] || [];

        // Find the last time slot
        const lastTimeSlot = newTimes[day][newTimes[day].length - 1];

        // Initialize start and end times with 30-minute increments or defaults if NaN
        const defaultStartTime = lastTimeSlot
            ? add30Minutes(lastTimeSlot.end)
            : '09:00';
        const defaultEndTime = lastTimeSlot
            ? add30Minutes(lastTimeSlot.end)
            : '09:30';

        newTimes[day].push({ start: defaultStartTime, end: defaultEndTime });
        setTimes(newTimes);
        onAvailabilityChange({ selectedDays, times });
    };

    const handleRemoveTimeSlot = (day, index) => {
        const newTimes = { ...times };
        newTimes[day].splice(index, 1);
        setTimes(newTimes);
        onAvailabilityChange({ selectedDays, times });
    };

    return (
        <div className="m-5 flex w-[90%] max-w-[500px] flex-col items-start rounded-[10px] border-2 border-solid border-[#228b22] bg-[#f8f8f8] p-5 shadow-[0_0_10px_rgba(0,0,0,0.1)]">
            <h2 className="mb-5 text-2xl text-[#228b22]">
                Select Your Availability
            </h2>
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                <div key={day} className="flex items-baseline">
                    <label className="mb-2.5 flex w-[75px] items-center font-[bold] text-base">
                        <input
                            type="checkbox"
                            checked={selectedDays.includes(day)}
                            onChange={() => handleDayToggle(day)}
                            className="mr-2.5 h-[15px] w-[15px]"
                        />
                        {day}
                    </label>
                    {selectedDays.includes(day) && (
                        <div className="flex items-baseline">
                            {times[day]?.map((timeSlot, index) => (
                                <div
                                    key={index}
                                    className="mb-2.5 flex items-center">
                                    <label className="mb-2.5 flex w-[125px] items-center font-[bold] text-base">
                                        <input
                                            type="time"
                                            value={timeSlot.start}
                                            onChange={(e) =>
                                                handleTimeChange(
                                                    day,
                                                    index,
                                                    'start',
                                                    e.target.value,
                                                )
                                            }
                                            step="1800"
                                            className="mx-[1vw] h-10 w-[150%]"
                                        />
                                    </label>
                                    <label className="mb-2.5 flex w-[125px] items-center font-[bold] text-base">
                                        -
                                        <input
                                            type="time"
                                            value={timeSlot.end}
                                            onChange={(e) =>
                                                handleTimeChange(
                                                    day,
                                                    index,
                                                    'end',
                                                    e.target.value,
                                                )
                                            }
                                            step="1800"
                                            className="mx-[1vw] h-10 w-[150%]"
                                        />
                                    </label>
                                    <button
                                        className="mb-2.5 ml-[-1vw] mr-[1.5vw] cursor-pointer border-[none] bg-[#f8f8f8] px-3 py-2 text-[larger] text-[#747474] hover:rounded-[10px] hover:bg-[#85ab86]"
                                        onClick={() =>
                                            handleRemoveTimeSlot(day, index)
                                        }>
                                        x
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="mt-2.5 flex flex-col">
                        {selectedDays.includes(day) && (
                            <button
                                onClick={() => handleAddTimeSlot(day)}
                                className="mb-2.5 ml-auto mr-[1.5vw] cursor-pointer border-[none] bg-[#f8f8f8] px-3 py-2 text-[larger] font-bold text-[#747474] hover:rounded-[10px] hover:bg-[#85ab86]">
                                +
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AvailabilityForm;
