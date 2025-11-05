import React from 'react'
import CTSidebar from './CTSidebar'
import RequestsData from './RequestsData'

const CTRequests = () => {
    return (
        <div className='flex w-screen'>
            <CTSidebar />
            <div className='w-4/5 p-4 ml-auto h-screen'>
                <h1 className='text-4xl font-semibold text-[#8883f0] mt-3'>My Requests</h1>
                <div className='bg-slate-100 mt-8 pb-4 rounded-4 shadowboxer h-[90%] overflow-scroll'>
                    <div className='grid grid-cols-5 w-full justify-between items-center pt-4 px-8'>
                        <h1 className='font-semibold text-2xl w-[180px]'>Name</h1>
                        <h1 className='font-semibold ml-12 w-[150px] text-center text-2xl'>Location</h1>
                        <h1 className='font-semibold ml-12 w-[150px] text-center text-2xl'>Date</h1>
                        <h1 className='font-semibold ml-12 w-[150px] text-center text-2xl'>Needs</h1>
                        <h1 className='font-semibold ml-12 text-end text-2xl'>Action</h1>
                    </div>
                    {RequestsData.map((val, key) => (
                        <div key={key} className='grid grid-cols-5 w-full justify-between items-center mt-12 px-8'>
                            <h1 className='font-normal w-[180px] text-xl'>{val.customername}</h1>
                            <h1 className='font-normal text-xl w-[180px] text-center p-2 rounded-2 cursor-pointer mx-auto'>{val.customerlocation}</h1>
                            <h1 className='font-normal text-xl text-center'>{val.date}</h1>
                            <h1 className={`font-normal ml-12 w-[150px] text-xl p-2 rounded-2 text-center`}>
                                {val.servicerequest}
                            </h1>
                            <div className='flex flex-col items-end'>
                                <button className='bg-green-500 text-white p-1 px-3 font-semibold rounded-2 w-[100px]'>Accept</button>
                                <button className='bg-red-500 text-white p-1 px-3 font-semibold rounded-2 mt-2 w-[100px]'>Reject</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default CTRequests;
