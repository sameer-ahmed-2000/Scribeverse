import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInterest, selectAllInterests, selectInterestError, selectInterestStatus } from '../store/Slices/interestSlice';
import { AppDispatch } from '../store/store';

const NavigationMenu: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const interests = useSelector(selectAllInterests);
    const status = useSelector(selectInterestStatus);
    const error = useSelector(selectInterestError);

    const [showPlusButton, setShowPlusButton] = useState(true);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        if (menuRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = menuRef.current;
            setShowPlusButton(scrollLeft + clientWidth < scrollWidth - 1);
        }
    };

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchInterest());
        }
    }, [status, dispatch]);

    let content;

    if (status === 'loading') {
        content = <p className="px-4 pt-2">Loading...</p>;
    } else if (status === 'succeeded') {
        content = (
            <div className="flex space-x-4">
                {interests.map((interest, index) => (
                    <div key={index} className="p-2 cursor-pointer rounded">
                        {interest}
                    </div>
                ))}
            </div>
        );
    } else if (status === 'failed') {
        content = <p>Error: {error}</p>;
    }

    return (
        <>
            <div className='grid grid-cols-12'>
                <div className='col-span-2'>
                </div>
                <div className="flex items-center py-4 col-span-8 border-b-2 border-gray-300">
                    <button
                        onClick={() => menuRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
                        className="p-2 rounded"
                        aria-label="Scroll Left"
                    >
                        {'<'}
                    </button>
                    {showPlusButton && (
                        <button
                            className="p-2 rounded ml-2"
                            aria-label="Add More"
                        >
                            +
                        </button>
                    )}
                    <div
                        className="flex overflow-x-auto whitespace-nowrap scroll-smooth scrollbar-hide"
                        ref={menuRef}
                        onScroll={handleScroll}
                    >
                        <div className="px-4 pt-2">For You</div>
                        <div className="px-4 pt-2">Following</div>
                        {content}
                    </div>
                    <button
                        onClick={() => menuRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
                        className="p-2 rounded"
                        aria-label="Scroll Right"
                    >
                        {'>'}
                    </button>
                    
                </div>
                
                <div className='col=span-2'>
                </div>
            </div>
            
        </>
    );
};

export default NavigationMenu;
