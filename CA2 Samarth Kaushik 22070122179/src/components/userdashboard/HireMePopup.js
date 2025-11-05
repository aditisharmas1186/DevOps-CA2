import React, { useState, useRef, useEffect } from 'react';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import BasicDatePicker from '../BasicDatePicker';
import BasicTimePicker from '../BasicTimePicker';
import cross from './../media/cross.png';

const HireMePopup = ({ onClose }) => {
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
        <div className='w-screen h-screen fixed flex justify-center items-center bg-gray-50/50'>
            <div ref={popupRef} className='bg-white p-4 border-2 border-[#d3d9dd] rounded-2xl flex flex-col w-[400px]'>
                <div className='flex justify-between items-center'>
                    <h1 className='text-[#8883f0] font-[500] text-3xl'>Hire Me</h1>
                    <img className='h-6 w-6 cursor-pointer' src={cross} onClick={onClose}></img>
                </div>
                <div className='flex justify-between items-center w-full'>
                    <h1 className='text-xl w-1/2'>Date</h1>
                    <div className="scale-75 ml-auto">
                        <BasicDatePicker />
                    </div>
                </div>
                <div className='flex justify-between items-center w-full'>
                    <h1 className='text-xl w-1/2'>Time</h1>
                    <div className="scale-75">
                        <BasicTimePicker />
                    </div>
                </div>
                <div className='flex justify-between items-center mt-1 w-full'>
                    <h1 className='text-xl w-1/2'>Description</h1>
                    <input className='scale-75 py-2 px-1 border-[0.5px] rounded-[3px] border-[#c4c4c4] w-[200px] hover:border-black'></input>
                </div>
                <div className='w-1/2 ml-auto flex justify-end mt-2'>
                    <button className='ml-auto bg-[#8883f0] p-2 px-3 rounded-2 text-white'>Submit</button>
                </div>
            </div>
        </div>
    );
};

export default HireMePopup;
