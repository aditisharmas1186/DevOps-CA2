import React from 'react'

const CTRegistration = () => {
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
                            <input type='number' placeholder='(18-50 years)' className='rounded-2 border-1 border-[#dae3f0] p-1 px-2 bg-transparent'></input>
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
                        <div className='my-3 w-full grid grid-cols-2 items-center'>
                            <label className='text-xl'>Work Experience</label>
                            <input type='number' placeholder='in years' className='rounded-2 border-1 border-[#dae3f0] p-1 px-2 bg-transparent'></input>
                        </div>
                        <div className='my-3 w-full grid grid-cols-2 items-center'>
                            <label className='text-xl'>Services Provided</label>
                            <input placeholder='comma separated' className='rounded-2 border-1 border-[#dae3f0] p-1 px-2 bg-transparent'></input>
                        </div>
                    </div>
                    <button className='mx-auto mt-8 p-2 px-4 rounded-[30px] border-0 bg-[#8883f0] text-white text-xl font-normal'>Submit</button>
                </form>
            </div>

        </div>
    )
}

export default CTRegistration
