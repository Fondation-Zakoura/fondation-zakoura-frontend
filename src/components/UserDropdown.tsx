import React from "react";
import { Link } from "react-router-dom";

interface UserDropdownProps{
  isDropdownToggled:boolean;
}
const UserDropdown: React.FC<UserDropdownProps>= ({ isDropdownToggled }) => {
  return (
    <div
      className={`absolute font-nunito text-[13px] top-15 text-gray-700 border-gray-200 border shadow z-10 gap-3 py-5 px-4.5 bg-white rounded-md right-2 flex flex-col   items-start w-45 ${isDropdownToggled?"block":"hidden"} `}
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="user-menu-button"
      tabIndex={-1}
    >
      <Link to="/" className="">
        Mon Compte
      </Link>
      <Link to="/" className="">
        Se Déconnecter
      </Link>
    </div>
  );
};

export default UserDropdown;
