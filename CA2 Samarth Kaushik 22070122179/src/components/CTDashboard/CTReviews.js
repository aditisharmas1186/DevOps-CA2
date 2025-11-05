import React from 'react';
import CTSidebar from './CTSidebar';
import CTProfileData from './CTProfileData';
import star from './../media/star.png';

const CTReviews = () => {
    const reviews = CTProfileData[0].ctreviews;

    const totalReviews = reviews.length;
    const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

    return (
        <div className='flex w-screen overflow-x-hidden'>
            <CTSidebar />
            <div className='w-4/5 ml-auto p-4 overflow-x-hidden'>
                <h1 className='text-4xl font-semibold text-[#8883f0] mt-3'>Reviews</h1>
                <div className='flex justify-between items-center w-full pr-16 mt-4'>
                    <h1 className='text-xl'>Avg Rating: {avgRating.toFixed(1)}/5</h1>
                    <h1 className='text-xl'>Total Reviews: {totalReviews}</h1>
                </div>
                <div className='grid grid-cols-2 gap-8 gap-y-6 w-full mt-4'>
                    {reviews.map((val, key) => (
                        <div key={key} id='medbackground' className='flex justify-between p-8 px-12 rounded-4'>
                            <div className='flex flex-col items-center w-[40%]'>
                                <img className='w-24 h-24' src={val.icon} alt='User'></img>
                                <h1 className='mt-2 text-xl'>Anonymous</h1>
                            </div>
                            <div className='flex flex-col '>
                                <div className='flex items-center ml-auto'>
                                    <h1 className='text-2xl'>{val.rating}</h1>
                                    <img className='h-6 w-6' src={star} alt='Star'></img>
                                </div>
                                <h1 className='mt-4'>{val.review}</h1>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CTReviews;