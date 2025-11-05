import React, { useState } from 'react';
import Sidebar from '../Sidebar';
import usericon from './../media/ctpfp.png';
import CTData from './CTData';
import editicon from './../media/editicon.png';
import deleteicon from './../media/deleteicon.png';
import EventData from './EventData';
import UserData from './UserData';
import EditEventPopup from './EditEventPopup';
import EditProfilePopup from './EditProfilePopup';

const UserProfile = () => {
    const [activeComponent, setActiveComponent] = useState('HiredCaretakers');
    const [isEditPopupVisible, setIsEditPopupVisible] = useState(false);
    const [isProfilePopupVisible, setIsProfilePopupVisible] = useState(false);

    const renderActiveComponent = () => {
        switch (activeComponent) {
            case 'HiredCaretakers':
                return (
                    <div className='px-8 grid grid-cols-3 gap-4 overflow-x-hidden'>
                        {CTData.map((val, key) => (
                            <div id='medbackground' key={key} className='p-4 rounded-4 border-0'>
                                <div className='w-64'>
                                    <div className='flex justify-between'>
                                        <img className='w-12 h-12 rounded-full' src={val.cticon} alt='Caretaker'></img>
                                    </div>
                                    <h1 className='text-2xl text-[#8883f0] font-semibold'>{val.ctname}</h1>
                                    <h1 className='mt-3'>{val.ctlocation}</h1>
                                    <h1 className='my-1'>+91 {val.ctphone}</h1>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'MyEvents':
                return (
                    <div className='px-8 grid grid-cols-2 gap-2 overflow-x-hidden'>
                        {EventData.map((val, key) => (
                            <div id='medbackground' key={key} className='p-4 rounded-4 border-0'>
                                <div className='flex justify-between items-center'>
                                    <h1 className='text-2xl text-[#8883f0] font-semibold'>{val.eventname}</h1>
                                    <div className='flex'>
                                        <img onClick={handleOpenEditPopup} className='h-6 w-6 mr-2 opacity-60' src={editicon} alt='Edit'></img>
                                        <img className='h-6 w-6 opacity-60' src={deleteicon} alt='Delete'></img>
                                    </div>
                                </div>
                                <div className='flex flex-col pr-8'>
                                    <div className='flex mt-3'>
                                        <h1 className='text-lg'>{val.eventlocation}</h1>
                                    </div>
                                    <div className='flex my-1'>
                                        <h1 className='text-lg'>{val.eventdate}</h1>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'MedicalHistory':
                return (
                    <div className='px-8 grid grid-cols-2 gap-2 overflow-x-hidden'>
                        {UserData[0].usermedicalhistory.map((history, key) => (
                            <div id='medbackground' key={key} className='p-4 rounded-4 border-0'>
                                <div className='flex flex-col pr-8'>
                                    <div className='flex my-1'>
                                        <h1 className='flex-1'>Name</h1>
                                        <h1 className='text-lg'>{history.condition}</h1>
                                    </div>
                                    <div className='flex my-1'>
                                        <h1 className='flex-1'>Diagnosis Date</h1>
                                        <h1 className='text-lg'>{history.date}</h1>
                                    </div>
                                    <div className='flex my-1'>
                                        <h1 className='flex-1'>Treatment</h1>
                                        <h1 className='text-lg'>{history.treatment}</h1>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            default:
                return null;
        }
    };

    const handleOpenEditPopup = () => {
        setIsEditPopupVisible(true);
    };

    const handleCloseEditPopup = () => {
        setIsEditPopupVisible(false);
    };

    const handleOpenProfilePopup = () => {
        setIsProfilePopupVisible(true);
    };

    const handleCloseProfilePopup = () => {
        setIsProfilePopupVisible(false);
    };

    return (
        <div className='w-screen flex'>
            <Sidebar />
            {isEditPopupVisible && <EditEventPopup onClose={handleCloseEditPopup} />}
            {isProfilePopupVisible && <EditProfilePopup onClose={handleCloseProfilePopup} />}
            <div className='w-4/5 ml-auto p-8 h-screen overflow-hidden'>
                <div className='flex justify-between items-center px-8'>
                    <div className='flex items-center'>
                        <img className='w-24 h-24 mr-8' src={usericon} alt='User'></img>
                        <div>
                            <h1 className='text-xl my-1'>Name of User</h1>
                            <h1 className='my-1'>username</h1>
                            <h1>Akurdi, Pune</h1>
                        </div>
                    </div>
                    <div className='flex flex-col mr-8'>
                        <button onClick={handleOpenProfilePopup} className='m-1 p-2 px-4 rounded-3 text-white bg-blue-500 hover:scale-[1.02] duration-100'>Edit Profile</button>
                        <button className='m-1 p-2 px-4 rounded-3 text-white bg-green-400 hover:scale-[1.02] duration-100'>Medication</button>
                    </div>
                </div>
                <div className='flex w-full justify-between px-4 mt-20'>
                    <button
                        className={`p-16 py-2 hover:scale-105 duration-200 rounded-3 border-0 ${activeComponent === 'HiredCaretakers' ? 'bg-blue-500 text-white' : 'bg-slate-200'}`}
                        onClick={() => setActiveComponent('HiredCaretakers')}
                    >
                        Hired Caretakers
                    </button>
                    <button
                        className={`p-16 py-2 hover:scale-105 duration-200 rounded-3 border-0 ${activeComponent === 'MyEvents' ? 'bg-blue-500 text-white' : 'bg-slate-200'}`}
                        onClick={() => setActiveComponent('MyEvents')}
                    >
                        My Events
                    </button>
                    <button
                        className={`p-16 py-2 hover:scale-105 duration-200 rounded-3 border-0 ${activeComponent === 'MedicalHistory' ? 'bg-blue-500 text-white' : 'bg-slate-200'}`}
                        onClick={() => setActiveComponent('MedicalHistory')}
                    >
                        Medical History
                    </button>
                </div>
                <div className='w-[95%] bg-[#eff3f6] h-[2px] m-8 mx-auto mt-4'></div>
                <div className='h-[55%] overflow-y-scroll overflow-x-hidden'>
                    {renderActiveComponent()}
                </div>

            </div>
        </div>
    );
};

export default UserProfile;
