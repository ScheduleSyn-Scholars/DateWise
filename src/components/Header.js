import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header className="flex w-full items-center bg-green-800 px-2 py-2 text-white">
            <img src="BearLogo.png" alt="Logo" className="h-28 w-auto" />

            <p className="font m1-auto text-5xl">DateWise</p>

            <div className="flex-grow"></div>

            <Link to="/MyProfile">
                <div className="pr-4">
                    <img
                        alt="User profile"
                        src={process.env.PUBLIC_URL + '/user.png'}
                        className="mt-2 h-24 w-24 rounded-full bg-gray-300"
                    />
                </div>
            </Link>
        </header>
    );
};

export default Header;
