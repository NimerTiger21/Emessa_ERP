import React, { useEffect } from "react";
import { AiOutlineMenu } from "react-icons/ai";
import { FiAlertTriangle, FiDroplet, FiBarChart2 } from "react-icons/fi";
import { AiOutlineShoppingCart } from "react-icons/ai";


import { MdKeyboardArrowDown } from "react-icons/md";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import avatar from "../data/avatar.jpg";
import { Cart, Chat, Notification, UserProfile } from ".";
import { useStateContext } from "../contexts/ContextProvider";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

const NavButton = ({ title, customFunc, icon, color, dotColor }) => (
  <TooltipComponent content={title} position="BottomCenter">
    <button
      type="button"
      onClick={customFunc}
      style={{ color }}
      className="relative text-xl rounded-full p-3 hover:bg-light-gray"
    >
      <span
        style={{ background: dotColor }}
        className="absolute inline-flex rounded-full h-2 w-2 top-2 right-2"
      />
      {icon}
    </button>
  </TooltipComponent>
);

function Navbar() {
  const {
    activeMenu,
    setActiveMenu,
    isClicked,
    handleClick,
    screenSize,
    setScreenSize,
    currentColor,
  } = useStateContext();

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (screenSize <= 900) {
      setActiveMenu(false);
    } else {
      setActiveMenu(true);
    }
  }, [screenSize]);

  return (
    <div className="flex justify-between p-2 md:mx-6 relative">
      <NavButton
        title="Menu"
        customFunc={() => setActiveMenu(!activeMenu)}
        icon={<AiOutlineMenu />}
        color={currentColor}
        dotColor={currentColor}
      />
      <div className="flex gap-3">
        {/* <NavButton title="Cart" customFunc={() => handleClick('cart')} icon={<FiShoppingCart />} color={currentColor} dotColor="#FF0000"/> */}
        <NavButton
          title="Defect Dashboard"
          customFunc={() => navigate("/defectslist")}
          icon={<FiAlertTriangle />} // or another defect-related icon
          color={currentColor}
          dotColor="#FF0000"
        />
        <NavButton
          title="Quality Dashboard"
          customFunc={() => navigate("/dashboard")}
          icon={<FiBarChart2 />}
          color={currentColor}
        />
        <NavButton
          title="Orders"
          customFunc={() => navigate("/orders")}
          icon={<AiOutlineShoppingCart />}
          color={currentColor}
          //dotColor={hasCriticalDefects ? "#FF0000" : "transparent"}
          dotColor={"transparent"}
        />
        <NavButton
          title="Wash Recipes"
          customFunc={() => navigate("/wash-recipe-list")}
          icon={<FiDroplet />}
          color={currentColor}
        />
        <TooltipComponent content="Profile" position="BottomCenter">
          <div
            className="flex items-center gap-2 cursor-pointer p-1 hover:bg-light-gray rounded-lg"
            onClick={() => handleClick("userProfile")}
          >
            <img 
            src={`${process.env.REACT_APP_API_URL}/${user?.avatar || avatar}`}
            alt="avatar" className="rounded-full w-8 h-8" />
            <p>
              <span className="text-gray-400 text-14">Hi, </span>{" "}
              <span className="text-gray-400 font-bold ml-1 text-14">
                {user.name}
              </span>
            </p>
            <MdKeyboardArrowDown className="text-gray-400 text-14" />
          </div>
        </TooltipComponent>

        {isClicked.cart && <Cart />}
        {isClicked.chat && <Chat />}
        {isClicked.notification && <Notification />}
        {isClicked.userProfile && <UserProfile />}
      </div>
      {/* <UserProfile> */}
      {/* Will now show role-specific options */}
    {/* </UserProfile> */}
    </div>
  );
}

export default Navbar;
