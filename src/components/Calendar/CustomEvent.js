import React from 'react';

const CustomEventComponent = ({ event }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '4px' }}>{event.title}</div>
            <div>{event.formattedTime}</div>
        </div>
    );
};

export default CustomEventComponent;
