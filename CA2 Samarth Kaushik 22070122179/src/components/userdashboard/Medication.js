import React from 'react';
import Sidebar from './../Sidebar';
import { MedicineData } from './MedicineData';

const getFrequencyStyle = (time) => {
    switch (time) {
        case 'Morning':
            return 'bg-yellow-200 text-yellow-800';
        case 'Noon':
            return 'bg-blue-200 text-blue-800';
        case 'Night':
            return 'bg-gray-200 text-gray-900';
        default:
            return '';
    }
};

const Medication = () => {
    return (
        <div className='w-screen flex hiddenx'>
            <Sidebar />
            <div className='w-4/5 ml-auto p-4 pt-0 hiddenx'>
                <div className='bg-white fixed w-3/4 pr-12 flex items-center border-b-2 border-b-[#eff3f6] py-4'>
                    <div>
                        <h1 className='text-4xl font-semibold text-[#8883f0] mt-3'>2Order Medication Here</h1>
                    </div>
                    <div className='grid grid-cols-3 gap-4 ml-auto items-center'>
                        <a target='blank' className='text-[#525252] px-4 p-1 border-2 border-[#525252] rounded-[20px] hover:bg-[#525252] hover:text-white duration-200 text-center' href='https://janaushadhi.gov.in/'>JanAushadi</a>
                        <a target='blank' className='text-[#525252] px-4 p-1 border-2 border-[#525252] rounded-[20px] hover:bg-[#525252] hover:text-white duration-200 text-center' href='https://www.medplusmart.com/'>MedPlus</a>
                        <a target='blank' className='text-[#525252] px-4 p-1 border-2 border-[#525252] rounded-[20px] hover:bg-[#525252] hover:text-white duration-200 text-center' href='https://www.wellnessforever.com/'>Wellness</a>
                    </div>
                </div>
                <div className='grid grid-cols-2 gap-4 w-[96%] mt-32 hiddenx'>
                    {MedicineData.map((val, index) => (
                        <div id='medbackground' key={index} className='mt-1 p-3 px-4 rounded-[24px] yflow'>
                            <div className='flex justify-between items-center pr-8'>
                                <h3 className='text-2xl font-semibold text-[#8883f0]'>{val.medname}</h3>
                                <h3 className='mt-2 text-lg bg-[#8883f0] rounded-[30px] text-white p-1 px-4'>{val.dosage}</h3>
                            </div>
                            <h3 className='mt-4 text-slate-500'>Frequency</h3>
                            <div className='mt-2 text-xl flex space-x-2'>
                                {val.frequency.split(' - ').map((time, i) => (
                                    <span key={i} className={`p-2 rounded ${getFrequencyStyle(time)}`}>{time}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Medication;
