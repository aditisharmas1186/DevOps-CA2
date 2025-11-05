import React from 'react'
import plusphoto from './media/plus.png'
import pluswhitephoto from './media/plus-hover.png'
import { useState } from 'react'


const UserRegistration = () => {

    const [infocounter, setinfoCounter] = useState(1);

    const handleAddinfo = () => {
        setinfoCounter(infocounter + 1);
    };

    const handleRemoveinfo = () => {
        if (infocounter > 1) {
            setinfoCounter(infocounter - 1);
        }
    };

    const [medicinecounter, setmedicineCounter] = useState(1);

    const handleAddmedicine = () => {
        setmedicineCounter(medicinecounter + 1);
    };

    const handleRemovemedicine = () => {
        if (medicinecounter > 1) {
            setmedicineCounter(medicinecounter - 1);
        }
    };

    return (
        <div className='w-screeen p-8 '>
            <div className='w-full h-full border-2 border-[#95989d] rounded-[24px] p-8 flex flex-col items-center shadowboxer bg-slate-50'>
                <h1 className='text-5xl text-center text-[#8883f0] font-semibold'>Join Old Citizens: Embrace a community that cares!</h1>
                <hr className='w-[95%] border-2 mt-4'></hr>
                <form className='w-full mt-4 flex flex-col'>
                    <div className='flex flex-col w-1/2 mx-auto bg-slate-100 rounded-lg p-4'>
                        <div className='my-2 w-full grid grid-cols-2 items-center'>
                            <label className='text-xl'>Name</label>
                            <input placeholder='Name' className='rounded-2 border-1 border-[#dae3f0] p-1 px-2 bg-transparent'></input>
                        </div>
                        <div className='my-2 w-full grid grid-cols-2 items-center'>
                            <label className='text-xl'>Username</label>
                            <input placeholder='Username' className='rounded-2 border-1 border-[#dae3f0] p-1 px-2 bg-transparent'></input>
                        </div>
                        <div className='my-2 w-full grid grid-cols-2 items-center'>
                            <label className='text-xl'>Email</label>
                            <input placeholder='Email' className='rounded-2 border-1 border-[#dae3f0] p-1 px-2 bg-transparent'></input>
                        </div>
                        <div className='my-2 w-full grid grid-cols-2 items-center'>
                            <label className='text-xl'>Password</label>
                            <input type='password' placeholder='Password' className='rounded-2 border-1 border-[#dae3f0] p-1 px-2 bg-transparent'></input>
                        </div>
                        <div className='my-2 w-full grid grid-cols-2 items-center'>
                            <label className='text-xl'>Mobile Number</label>
                            <input placeholder='+91' className='rounded-2 border-1 border-[#dae3f0] p-1 px-2 bg-transparent'></input>
                        </div>
                        <div className='my-2 w-full grid grid-cols-2 items-center'>
                            <label className='text-xl'>Location</label>
                            <input placeholder='Location' className='rounded-2 border-1 border-[#dae3f0] p-1 px-2 bg-transparent'></input>
                        </div>
                        <div className='my-2 w-full grid grid-cols-2 items-center'>
                            <label className='text-xl'>Age</label>
                            <input placeholder='(18-50 years)' className='rounded-2 border-1 border-[#dae3f0] p-1 px-2 bg-transparent'></input>
                        </div>
                        <div className='my-2 w-full grid grid-cols-2 items-center'>
                            <label className='text-xl'>Gender</label>
                            <select className='w-full p-1 px-2 bg-transparent rounded-2 border-1 border-[#dae3f0] text-xl text-[#95989d]' name="gender" id="gender">
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="others">Others</option>
                            </select>
                        </div>
                        <div className='my-2 w-full grid grid-cols-2 items-center'>
                            <label className='text-xl'>Aadhar Card Image</label>
                            <button className='rounded-xl p-2 px-4 bg-[#8883f0] text-white'>Upload Image</button>
                        </div>
                    </div>
                    <div className='w-full bg-slate-50 mt-8 flex justify-around'>
                        <div className='w-2/5 px-8'>
                            <div className='flex justify-between'>
                                <h1 className='text-2xl text-[#8883f0]'>Medical History</h1>
                                <div className='relative h-8 w-8 rounded-full flex' onClick={handleAddinfo}>
                                    <img className='h-full absolute hover:opacity-0 duration-100' src={pluswhitephoto}></img>
                                    <img className='h-full absolute hover:opacity-0 duration-100' src={plusphoto}></img>
                                </div>
                            </div>
                            <hr className='w-full border-2 mt-4 relative -top-4'></hr>
                            {
                                Array.from(Array(infocounter)).map((item, idx) => (
                                    <div className='flex flex-col m-0 mt-2 bg-slate-100 p-4 py-3 rounded-lg w-full'>
                                        <div className='my-2 w-full grid grid-cols-2 items-center'>
                                            <label className='text-xl'>Condition</label>
                                            <input className='rounded-2 border-1 border-[#dae3f0] p-1 px-2 bg-transparent'></input>
                                        </div>
                                        <div className='my-2 w-full grid grid-cols-2 items-center'>
                                            <label className='text-xl'>Diagnosis Date</label>
                                            <input className='rounded-2 border-1 border-[#dae3f0] p-1 px-2 bg-transparent'></input>
                                        </div>
                                        <div className='my-2 w-full grid grid-cols-2 items-center'>
                                            <label className='text-xl'>Treatment</label>
                                            <input className='rounded-2 border-1 border-[#dae3f0] p-1 px-2 bg-transparent'></input>
                                        </div>
                                        <div className='text-[#8883f0] ml-auto removeunderline' onClick={handleRemoveinfo}>Remove</div>
                                    </div>
                                ))
                            }
                        </div>
                        <div className='w-2/5 px-8'>
                            <div className='flex justify-between'>
                                <h1 className='text-2xl text-[#8883f0]'>Medication</h1>
                                <div className='relative h-8 w-8 rounded-full flex' onClick={handleAddmedicine}>
                                    <img className='h-full absolute hover:opacity-0 duration-100' src={pluswhitephoto}></img>
                                    <img className='h-full absolute hover:opacity-0 duration-100' src={plusphoto}></img>
                                </div>
                            </div>
                            <hr className='w-full border-2 mt-4 relative -top-4'></hr>
                            {
                                Array.from(Array(medicinecounter)).map((item, idx) => (
                                    <div className='flex flex-col m-0 mt-2 bg-slate-100 p-4 py-3 rounded-lg w-full'>
                                        <div className='my-2 w-full grid grid-cols-2 items-center'>
                                            <label className='text-xl'>Name</label>
                                            <input className='rounded-2 border-1 border-[#dae3f0] p-1 px-2 bg-transparent'></input>
                                        </div>
                                        <div className='my-2 w-full grid grid-cols-2 items-center'>
                                            <label className='text-xl'>Dosage</label>
                                            <input className='rounded-2 border-1 border-[#dae3f0] p-1 px-2 bg-transparent'></input>
                                        </div>
                                        <div className='my-2 w-full grid grid-cols-2 items-center'>
                                            <label className='text-xl'>Frequency</label>
                                            <input className='rounded-2 border-1 border-[#dae3f0] p-1 px-2 bg-transparent'></input>
                                        </div>
                                        <div className='text-[#8883f0] ml-auto removeunderline' onClick={handleRemovemedicine}>Remove</div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                    <button className='m-8 ml-auto p-2 px-4 rounded-[30px] border-0 bg-[#8883f0] text-white font-normal'>Submit</button>
                </form>
            </div>

        </div>
    )
}

export default UserRegistration
