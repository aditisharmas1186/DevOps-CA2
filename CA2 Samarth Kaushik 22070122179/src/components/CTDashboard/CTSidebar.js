import React from 'react'
import { CTSidebarData } from './CTSidebarData'
import { Link } from 'react-router-dom'
import usericon from './../media/ctpfp.png'
import CTProfileData from './CTProfileData'

const CTSidebar = () => {
    return (
        <div className='w-1/5 h-screen bg-[#8883f0] flex flex-col items-center fixed'>
            <h1 className='my-8 text-5xl font-semibold text-white'>Grammie</h1>
            {CTSidebarData.map((val, key) => {
                return (
                    <div className='w-full h-16 flex hover:bg-[#6c65eb] duration-100 flex items-center' id={window.location.pathname == val.link ? "sidebaractive" : ""} key={key} onClick={() => { window.location.pathname = val.link }}>
                        <div className='mx-4 text-xl font-[400] text-[#ebebeb]'>{val.title}</div>
                    </div>
                )
            })}
            <div className='mb-4 ml-2 mt-auto flex items-center mr-auto ml-0'>
                <Link to="/ctprofile">
                    <div className='rounded-full h-24 w-24 mr-4'>
                        <img className='w-full' src={usericon}></img>
                    </div>
                </Link>
                <div className='flex flex-col h-24'>
                    <Link to="/ctprofile">
                        <h3 className='my-2 text-xl'>{CTProfileData[0].ctusername}</h3>
                    </Link>
                    <Link to="/">
                        <h3 className='p-2 px-4 bg-[#ebebeb] text-[#8883f0] rounded-2'>Logout</h3>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default CTSidebar

