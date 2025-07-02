import React, { useState, useEffect, useRef } from "react";
import { CiMenuBurger } from "react-icons/ci";
import userImage from "../../src/assets/images/candidates/0.jpg";
import logo from "../assets/images/zakoura-logo.svg";
import { IoGridOutline } from "react-icons/io5";
import { IoNotificationsOutline } from "react-icons/io5";
import { PiToggleLeftFill } from "react-icons/pi";
import { BsArrowsFullscreen } from "react-icons/bs";
import { Link } from "react-router-dom";
import UserDropdown from "./UserDropdown";
import AppLauncherDropdown from "./AppLauncherDropdown";


interface HeaderProps{
    handleSidebarToggle:()=>void;
    menuButtonRef:React.RefObject<HTMLButtonElement |null>;

}
//test

const Header :React.FC<HeaderProps>= ({handleSidebarToggle,menuButtonRef }) => {
    const [notificationCount, setNotificationCount] = useState<number>(0);
    const [isDropdownToggled, setIsDropdownToggled] = useState<boolean >(false);
    const [isAppLauncherToggled, setIsAppLauncherToggled] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const appLauncherRef = useRef<HTMLDivElement >(null);
   

    const handledropdownToggle = () => {
        setIsDropdownToggled((prev) => !prev);
    };
    const handleAppLauncherToggle = () => {
        setIsAppLauncherToggled((prev) => !prev);
    };

    useEffect(() => {
        if (!isDropdownToggled) return;

        const handleClickOutside = (event:MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsDropdownToggled(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDropdownToggled]);

    useEffect(() => {
        if (!isAppLauncherToggled) return;

        const handleClickOutside = (event:MouseEvent) => {
            if (
                appLauncherRef.current &&
                !appLauncherRef.current.contains(event.target as Node)
            ) {
                setIsAppLauncherToggled(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isAppLauncherToggled]);
    

    return (
        <nav
            className="flex shadow w-full m-0  p-6  items-center  justify-between bg-white "
            aria-label="Main navigation"
        >
            <div className="px-3">
                <button
                    aria-label="Open menu"
                    className="focus:outline-none "
                    tabIndex={0}
                    onClick={handleSidebarToggle} 
                     ref={menuButtonRef}
                >
                    <CiMenuBurger size={22} aria-hidden="true" className="cursor-pointer text-gray-500 hover:text-gray-800" />
                </button>
            </div>
            <div className="flex items-center  gap-5 px-10">
                <div className="">
                    <Link to="/" aria-label="Go to homepage">
                        <img src={logo} className="lg:min-w-48 h-9 min-w-34 cursor-pointer" alt="Zakoura logo" />
                    </Link>
                </div>
                <button
                    aria-label="Toggle dark mode  "
                    className="focus:outline-none"
                >
                    <PiToggleLeftFill className="text-gray-300  cursor-pointer" size={44} aria-hidden="true" />
                </button>
                <div className="relative  hidden lg:block" ref={appLauncherRef}>
                    <button
                        aria-label="Open grid menu"
                        className="relative align-middle "
                        onClick={handleAppLauncherToggle}
                    >
                        <IoGridOutline
                            className="text-gray-400 hover:text-gray-600 cursor-pointer"
                            size={19}
                            aria-hidden="true"
                        />
                    </button>
                    <AppLauncherDropdown isAppLauncherToggled={isAppLauncherToggled} />
                </div>
                <div className="relative  hidden lg:block">
                    <button
                        aria-label={`You have ${notificationCount} notifications`}
                        className="focus:outline-none align-middle"
                    >
                        <IoNotificationsOutline
                            className="text-gray-400 hover:text-gray-600 cursor-pointer "
                            size={20}
                            aria-hidden="true"
                        />
                        <span
                            className="border rounded-full text-[10px] absolute -top-3 -right-1.5 h-[18px] min-w-[18px] flex items-center justify-center bg-white"
                            role="status"
                            aria-live="polite"
                        >
                            {notificationCount}
                        </span>
                    </button>
                </div>
                <button
                    aria-label="Enter fullscreen"
                    tabIndex={0}
                >
                    <BsArrowsFullscreen
                        className="text-gray-400 hover:text-gray-600 cursor-pointer hidden lg:block"
                        size={17}
                        aria-hidden="true"
                    />
                </button>
                <div
                    className="relative cursor-pointer"
                    onClick={handledropdownToggle}
                    ref={dropdownRef}
                >
                    <img
                        src={userImage}
                        className="min-w-10 h-10 rounded-full "
                        alt="User profile"
                    />
                    <UserDropdown isDropdownToggled={isDropdownToggled} />
                </div>
            </div>
        </nav>
    );
};

export default Header;
