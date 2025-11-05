import React from 'react'
import { Link } from "react-router-dom";

const registration = () => {
    return (
        <div className='h-screen w-screen flex justify-center items-center flex-col'>
            <div className='w-2/3 flex flex-col items-center'>
                <h1 className='text-4xl'>Register youself as an elderly or a caretaker</h1>
                <div className='flex justify-between'>
                    <Link to="/userregister">
                        <div className='flex registerbuttons cursor-pointer justify-center items-center px-[40px] py-[25px] rounded-[16px] border-[3px] border-[#8883f0] m-16'>
                            <h1 className='text-[#8883f0] font-semi-bold text-4xl'>Elderly</h1>
                        </div>
                    </Link>
                    <Link to="/ctregister">
                        <div className='flex registerbuttons cursor-pointer justify-center items-center px-[40px] py-[25px] rounded-[16px] border-[3px] border-[#8883f0] m-16'>
                            <h1 className='text-[#8883f0] font-semi-bold text-4xl'>Caretaker</h1>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default registration
