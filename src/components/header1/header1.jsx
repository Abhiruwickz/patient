import React from 'react';
import { FaBell } from 'react-icons/fa';
import Logo1 from '../assets/logomedi.png';

const Header = () => {
    return (
        <header className="w-full bg-[#eef3fc] shadow-md">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-[70px]">
                {/* Logo Section */}
                <div className="flex items-center gap-3 ">
                    <img
                        src={Logo1}
                        alt="Logo"
                        className="w-30 h-20 object-cover"
                    />
                    <div>
                        <span className="text-2xl font-bold text-[#00897b]">
                            Medi
                            <span className="text-[#4aa0ff]">Connect</span>
                        </span>
                    </div>
                </div>

                {/* Bell Icon */}
                <FaBell className="text-2xl text-black cursor-pointer" />
            </div>
        </header>
    );
};

export default Header;
