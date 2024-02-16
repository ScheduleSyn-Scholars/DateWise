import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    return <header className='bg-green-800 text-white py-2 px-2 flex items-center fixed w-full top-0 z-50'>

     <img src="bearlogo.png" alt="Logo" className="h-28 w-auto" />
            
     <p className="text-5xl font m1-auto">DateWise</p>

     <div className="flex-grow"></div>

     <Link to="/MyProfile">
                    <div className='pr-4'>
                        <img
                            alt="User profile"
                            src={process.env.PUBLIC_URL + '/user.png'}
                            className="mt-2 h-24 w-24 rounded-full bg-gray-300"
                        />
                    </div>
                </Link>

    </header>
     
};

export default Header;
