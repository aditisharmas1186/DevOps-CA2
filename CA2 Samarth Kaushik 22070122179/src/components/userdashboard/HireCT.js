import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import userpfp from './../media/ctpfp.png';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import BasicDatePicker from '../BasicDatePicker';
import BasicTimePicker from '../BasicTimePicker';
import HireMePopup from './HireMePopup';
import star from './../media/star.png';
import { CTData } from './CTData';
import axios from 'axios';


const HireCT = () => {
    //const [CTData, setCTData] = useState([CTData]);

    const [selectedCaretaker, setSelectedCaretaker] = useState(CTData[0]);

    const handleCaretakerClick = (caretaker) => {
        setSelectedCaretaker(caretaker);
    };

    const [isPopupVisible, setIsPopupVisible] = useState(false);

    const handleOpenPopup = () => {
        setIsPopupVisible(true);
    };

    const handleClosePopup = () => {
        setIsPopupVisible(false);
    };

    /* useEffect(() => {
        axios.get('/caretaker').then(response => {
            setCTData(response.data);
            setSelectedCaretaker(response.data[0]);
            console.log(response.data);
        })
        .catch((error)=> {
            console.log(error);
        });
    }, []); */

    return (
        <div className='w-screen flex'>

            <Sidebar />
            {isPopupVisible && <HireMePopup onClose={handleClosePopup} />}

            <div className='w-4/5 p-4 ml-auto h-screen'>
                <h1 className='text-4xl font-semibold text-[#8883f0] mt-3'>Hire Caretaker</h1>
                <div className=' h-[90%] rounded-[24px] p-2 mt-4 shadowboxer flex'>
                    <div className='w-[30%] bg-gray-300 rounded-4 overflow-scroll overflow-x-hidden'>
                        {CTData.map((val, key) => (
                            <div
                                key={key}
                                id='ctbackground'
                                className='hover:bg-slate-200 h-30 m-2 p-3 flex items-center rounded-4 cursor-pointer'
                                onClick={() => handleCaretakerClick(val)}
                            >
                                <img className='h-12 w-12 rounded-full mr-4' src={val.cticon} alt={val.ctname} />
                                <h1 className='text-[#424242] . text-xl font-[500]'>{val.ctname}</h1>
                            </div>
                        ))}
                    </div>
                    {selectedCaretaker && (
                        <div className='p-4 w-[80%] overflow-scroll'>
                            <div className='p-4 pl-2 rounded flex items-start'>
                                <img className='h-20 w-20 rounded-full mr-8' src={userpfp} alt={selectedCaretaker.ctname} />
                                <div className=''>
                                    <h3 className='text-2xl font-semibold text-[#8883f0]'>{selectedCaretaker.ctname}</h3>
                                    <p className=''>Age: {selectedCaretaker.ctage} years</p>
                                    <p className=''>Location: {selectedCaretaker.ctlocation}</p>
                                    <p className=''>Price: {selectedCaretaker.ctprice}</p>
                                </div>
                                <div className='flex flex-col gap-4 mr-4 ml-auto'>
                                    <button onClick={handleOpenPopup} className='bg-blue-500 text-white p-2 px-4 rounded'>Hire Me</button>

                                    <button className='bg-green-500 text-white p-2 px-4 rounded'>Call Me</button>
                                </div>
                            </div>
                            <div className='mt-8 px-2 w-full flex flex-col'>
                                <div className='flex items-center my-2'>
                                    <h1 className='text-xl w-2/5'>Rates per Month</h1>
                                    <p className='text-xl'>{selectedCaretaker.ctprice}</p>
                                </div>
                                <div className='flex items-center my-2'>
                                    <h1 className='text-xl w-2/5'>Experience</h1>
                                    <p className='text-xl'>{selectedCaretaker.ctexperience}</p>
                                </div>
                                <div className='flex items-center my-2'>
                                    <h1 className='text-xl w-2/5'>Services</h1>
                                    <p className='text-xl'>{selectedCaretaker.ctservices}</p>
                                </div>
                            </div>
                            <div className='mt-8 '>
                                <h1 className='text-xl font-bold'>Reviews</h1>
                                <div className='grid grid-cols-2 gap-2 overflow-scroll'>
                                    {selectedCaretaker.ctreviews.map((review, index) => (
                                        <div key={index} className='mt-1 p-4 bg-gray-100 rounded'>
                                            <div className='flex w-full justify-between'>
                                                <h3 className='text-lg font-semibold'>Anonymous</h3>
                                                <div className='flex items-center'>
                                                    <h1 className='text-xl mr-1'>{review.rating}</h1>
                                                    <img className='w-6 h-6' src={star}></img>
                                                </div>
                                            </div>
                                            <p className='mt-2'>{review.review}</p>
                                        </div>
                                    ))}
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default HireCT;
