import React, { useContext, useState } from "react";
import {
  MdOutlineCancel,
  MdSecurity,
  MdAnalytics,
  MdReport,
} from "react-icons/md";
import { FiSettings, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { Button } from ".";
import { useStateContext } from "../contexts/ContextProvider";
import avatar from "../data/avatar.jpg";
//import { AuthContext } from '../contexts/AuthContext';
import { useAuth } from "../contexts/AuthContext";

const UserProfile = () => {
  const { currentColor, setIsClicked } = useStateContext();

  //const { logout, user } = useContext(AuthContext);
  //const { logout, user } = useContext(useAuth);
  //console.log("Auth context value:", useAuth()); // Check what's actually in the context
  const { logout, user } = useAuth(); // Now properly destructured
  const navigate = useNavigate();

  // Quality control specific profile items
  const profileData = [
    {
      icon: <MdAnalytics />,
      title: "Quality Dashboard",
      desc: "View defect analytics",
      iconColor: "#03C9D7",
      iconBg: "#E5FAFB",
      onClick: () => navigate("/quality-dashboard"),
    },
    {
      icon: <MdReport />,
      title: "Defect Reports",
      desc: "Generate quality reports",
      iconColor: "#FF5C8E",
      iconBg: "#FFE0E0",
      onClick: () => navigate("/reports"),
    },
    {
      icon: <MdSecurity />,
      title: "Permissions",
      desc: "Manage access levels",
      iconColor: "#7352FF",
      iconBg: "#E5E0FF",
      onClick: () => navigate("/settings/permissions"),
    },
    {
      icon: <FiSettings />,
      title: "Settings",
      desc: "Account configuration",
      iconColor: "#FF8A00",
      iconBg: "#FFEFD8",
      onClick: () => navigate("/settings"),
    },
  ];

  const handleLogout = async () => {
    try {
      await logout(); // Wait for logout to complete
      console.log("User logged out");
      navigate("/");
      //setIsClicked(false); // Close the profile menu
      setIsClicked(prev => ({ ...prev, userProfile: false }))
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="nav-item absolute right-1 top-16 bg-white dark:bg-[#42464D] p-8 rounded-lg w-96 shadow-xl z-50">
      <div className="flex justify-between items-center">
        <p className="font-semibold text-lg dark:text-gray-200">
          Quality Control Profile
        </p>
        <Button
          icon={<MdOutlineCancel />}
          color="rgb(153, 171, 180)"
          bgHoverColor="light-gray"
          size="2xl"
          borderRadius="50%"
          //onClick={() => setIsUserProfileOpen(false)}
          onClick={() => setIsClicked(false)}
        />
      </div>
      <div className="flex gap-5 items-center mt-6 border-color border-b-1 pb-6">
        <img
          className="rounded-full h-24 w-24 border-2"
          //src={user?.avatar || avatar}
          src={`${process.env.REACT_APP_API_URL}/${user?.avatar || avatar}`}
          alt="user-profile"
          style={{ borderColor: currentColor }}
        />
        <div>
          <p className="font-semibold text-xl dark:text-gray-200">
            {user?.name || "Quality User"}
          </p>
          <p className="text-gray-500 text-sm dark:text-gray-400 capitalize">
            {user?.role?.replace("_", " ") || "Operator"}
          </p>
          <p className="text-gray-500 text-sm font-semibold dark:text-gray-400">
            {user?.email || "user@emessadenim.com"}
          </p>
          <p className="text-xs mt-1 text-gray-400 dark:text-gray-300">
            Department: {user?.department || "Quality"}
          </p>
        </div>
      </div>
      <div>
        {profileData.map((item, index) => (
          <div
            key={index}
            className="flex gap-5 border-b-1 border-color p-4 hover:bg-light-gray cursor-pointer dark:hover:bg-[#42464D]"
            onClick={item.onClick}
          >
            <button
              type="button"
              style={{ color: item.iconColor, backgroundColor: item.iconBg }}
              className="text-xl rounded-lg p-3 hover:bg-light-gray"
            >
              {item.icon}
            </button>
            <div>
              <p className="font-semibold dark:text-gray-200">{item.title}</p>
              <p className="text-gray-500 text-sm dark:text-gray-400">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5">
        <Button
          color="white"
          bgColor={currentColor}
          text="Logout"
          borderRadius="10px"
          width="full"
          icon={<FiLogOut />}
          onClick={handleLogout}
        />
      </div>
    </div>
  );
};

export default UserProfile;
