import React from 'react';

const CustomEventComponent = ({ event }) => {
    const currentDate = new Date();
    let style =
        event.start > currentDate
            ? 'flex flex-col bg-blue-500'
            : 'flex flex-col bg-gray-500';
    return (
        <div className={style}>
            <div style={{ marginBottom: '4px' }}>{event.title}</div>
            <div>{event.formattedTime}</div>
        </div>
    );
};

export default CustomEventComponent;
