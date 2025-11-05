import React, { useRef, useEffect } from 'react';
import BasicDatePicker from '../BasicDatePicker';
import BasicTimePicker from '../BasicTimePicker';
import cross from './../media/cross.png';
import EventData from './EventData';

const EditProfilePopup = ({ onClose }) => {
    const popupRef = useRef();

    const handleClickOutside = (event) => {
        if (popupRef.current && !popupRef.current.contains(event.target)) {
            onClose();
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className='fixed inset-0 flex justify-center items-center bg-gray-50/50 z-50'>
            <div ref={popupRef} className='bg-white p-4 border-2 border-[#d3d9dd] rounded-2xl flex flex-col w-1/2'>
                <div className='flex justify-between items-center'>
                    <h1 className='text-[#8883f0] font-[500] text-3xl pb-4'>Edit Profile</h1>
                    <img className='h-6 w-6 cursor-pointer' src={cross} onClick={onClose}></img>
                </div>
                <form className='w-full flex flex-col'>
                    <div className='flex flex-col w-full mx-auto bg-slate-100 rounded-lg px-4'>
                        <div className='my-2 w-full grid grid-cols-2 items-center'>
                            <label className='text-xl text-[#1a1a1a]'>First Name</label>
                            <input placeholder='First Name' className='rounded-2 border-1 border-[#bcb9bf] p-2 px-2 bg-transparent placeholder:text-[#646768] hover:border-[#646768]'></input>
                        </div>
                        <div className='my-2 w-full grid grid-cols-2 items-center'>
                            <label className='text-xl text-[#1a1a1a]'>Last Name</label>
                            <input placeholder='Last Name' className='rounded-2 border-1 border-[#bcb9bf] p-2 px-2 bg-transparent placeholder:text-[#646768] hover:border-[#646768]'></input>
                        </div>
                        <div className='my-2 w-full grid grid-cols-2 items-center'>
                            <label className='text-xl text-[#1a1a1a]'>Location</label>
                            <input placeholder='Location' className='rounded-2 border-1 border-[#bcb9bf] p-2 px-2 bg-transparent placeholder:text-[#646768] hover:border-[#646768]'></input>
                        </div>
                        <div className='my-2 w-full grid grid-cols-2 items-center'>
                            <label className='text-xl text-[#1a1a1a]'>Mobile Number</label>
                            <input type='number' placeholder='+91' className='rounded-2 border-1 border-[#bcb9bf] p-2 px-2 bg-transparent placeholder:text-[#646768] hover:border-[#646768]'></input>
                        </div>
                    </div>
                    <button className='mr-auto mt-4 p-2 px-4 rounded-[30px] border-0 bg-[#8883f0] text-white text-xl font-normal'>Save Changes</button>
                </form>
            </div>
        </div>
    );
};

export default EditProfilePopup;
