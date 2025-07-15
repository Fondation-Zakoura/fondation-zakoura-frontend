import React from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "@/features/user/userSlice";
import { useNavigate } from "react-router-dom";

interface UserDropdownProps{
  isDropdownToggled:boolean;
}
const UserDropdown: React.FC<UserDropdownProps>= ({ isDropdownToggled }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    navigate("/login");
  };

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
      <button onClick={handleLogout} className="w-full text-left mt-2 text-red-600 hover:text-red-800">
        Se Déconnecter
      </button>
    </div>
  );
};

export default UserDropdown;
