import React from 'react'
import { Link } from "react-router-dom";

import google from './media/googlelogo.png'

const Homepage = () => {
    return (
        <div className='flex flex-row w-screen h-screen bg-white justify-center googlecontainer'>
            <div className='flex flex-col items-start justify-end p-12 bg-[#8883F0] w-1/2 m-12 mr-0 rounded-l-[24px]'>
                <h1 className='text-5xl font-semibold text-[#dae3f0]'>Health at your hand at your fingertips</h1>
                <h3 className='mt-4 text-white'>Health app is a modern way to take charge of your well-being.</h3>
            </div>
            <div className='w-2/5 rounded-r-[24px] m-12 ml-0 bg-[#fbfafa] p-8'>
                <div className='mt-8 flex items-center'>
                    <h1 className='text-4xl font-bold text-[#8883f0]'>Grammie</h1>
                </div>
                <h1 className='text-5xl mt-12 text-[#928df1]'>Welcome back</h1>
                <h3 className='text-2xl text-[#95989d]'>Login to your account or create one using google</h3>
                <Link to='/register'>
                    <div className='flex justify-center items-center border-[2px] border-[#DAE3F0] rounded-[8px] mt-12 hover:bg-[#DAE3F0] duration-300'>
                        <img src={google} className='h-6'></img>
                        <h1 className='text-2xl text-[#95989d] m-2'>Sign In using Google</h1>
                    </div>
                </Link>
            </div>
        </div>
    )
}

export default Homepage
