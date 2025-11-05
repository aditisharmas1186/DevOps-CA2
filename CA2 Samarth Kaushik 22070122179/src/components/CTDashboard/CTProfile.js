import React, { useState } from 'react';
import CTSidebar from './CTSidebar';
import cticon from './../media/ctpfp.png';
import CTProfileData from './CTProfileData';
import EditProfilePopup from './EditProfilePopup';

const CTProfile = () => {
    const [isProfilePopupVisible, setIsProfilePopupVisible] = useState(false);

    const handleOpenProfilePopup = () => {
        setIsProfilePopupVisible(true);
    };

    const handleCloseProfilePopup = () => {
        setIsProfilePopupVisible(false);
    };

    return (
        <div className='flex w-screen'>
            <CTSidebar />
            {isProfilePopupVisible && <EditProfilePopup onClose={handleCloseProfilePopup} />}
            <div className='w-4/5 ml-auto h-screen'>
                <div className='flex justify-between items-center px-8 mt-8'>
                    <div className='flex items-center'>
                        <img className='w-24 h-24 mr-8' src={cticon} alt='User'></img>
                        <div>
                            <h1 className='text-xl my-1'>{CTProfileData[0].ctname}</h1>
                            <h1 className='my-1'>{CTProfileData[0].ctusername}</h1>
                            <h1>{CTProfileData[0].ctlocation}</h1>
                        </div>
                    </div>
                    <div className='flex flex-col mr-8'>
                        <button
                            className='m-1 p-2 px-4 rounded-3 text-white bg-blue-500 hover:scale-[1.02] duration-100'
                            onClick={handleOpenProfilePopup}
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>
                <div className='mt-12 flex flex-col w-[95%] h-[70%] mx-auto rounded-4 px-12'>
                    <div className='flex items-center my-4'>
                        <h1 className='text-xl w-2/5 text-[#6b6b6b]'>Age</h1>
                        <p className='text-xl font-semibold'>{CTProfileData[0].ctage}</p>
                    </div>
                    <div className='flex items-center my-4'>
                        <h1 className='text-xl w-2/5 text-[#6b6b6b]'>Work Experience</h1>
                        <p className='text-xl font-semibold'>{CTProfileData[0].workexperience}</p>
                    </div>
                    <div className='flex items-center my-4'>
                        <h1 className='text-xl w-2/5 text-[#6b6b6b]'>Services Provided</h1>
                        <p className='text-xl font-semibold'>{CTProfileData[0].services}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CTProfile;