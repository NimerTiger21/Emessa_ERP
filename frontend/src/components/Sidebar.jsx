import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { SiShopware } from 'react-icons/si'
import { MdOutlineCancel } from 'react-icons/md'
import { TooltipComponent } from '@syncfusion/ej2-react-popups'
import { links } from '../data/dummy'
import { useStateContext } from '../contexts/ContextProvider'

import { useAuth } from "../contexts/AuthContext"; // ⬅️ Add this

const Sidebar = () => {
  const { activeMenu, setActiveMenu, screenSize, currentColor } = useStateContext();

  const { user } = useAuth(); // ⬅️ Use current user
  //const activeMenu = true;
  const handleCloseSidebar = () => {
    if (activeMenu && screenSize <= 900) {
      setActiveMenu(false)
    }
  }
  const activeLink = 'flex items-center gap-5 pl-4 pt-3 pb-2.5 rounded-lg text-white text-md m-2';
  const normalLink = 'flex items-center gap-5 pl-4 pt-3 pb-2.5 rounded-lg text-md text-gray-700 dark:text-gray-200 dark:hover:text-black hover:bg-light-gray m-2';
  return (
    <div className='ml-3 h-screen md:overflow-hidden overflow-auto md:hover:overflow-auto pb-10'>
      {activeMenu && (<>
        <div className='flex justify-between items-center'>
          <Link to="/" onClick={handleCloseSidebar} className="items-center gap-3 ml-3 flex text-xl font-extrabold tracking-tight dark:text-white text-slate-900">
            {/* <SiShopware size={30} /> <span>Shoppy</span> */}
            <img src="https://www.emessa-denim.com/wp-content/uploads/2024/04/emessa-denim-blue.svg" alt="logo" style={{ width: '150px', height: '150px' }} />
          </Link>
          <TooltipComponent content="Menu" position="BottomCenter">
            <button type="button" onClick={() => setActiveMenu((prevActiveMenu) => !prevActiveMenu)} className="text-xl rounded-full p-3 hover:bg-light-gray mt-4 block md:hidden">
              <MdOutlineCancel />
            </button>            
            </TooltipComponent>       
        </div>
        <div className='mt-10'>
          {links.map((item) => (
            <div key={item.title}>
                <p className='text-gray-400 m-3 mt-4 uppercase'>
                    {item.title}
                </p>
                {item.links
                .filter((link) => !link.roles || link.roles.includes(user?.role))
                .map((link) => (
                    <NavLink
                        to={`/${link.name}`}
                        key={link.name}
                        onClick={handleCloseSidebar}
                        style={({ isActive }) => ({ backgroundColor: isActive ? currentColor : '' })}
                        className={({ isActive }) => isActive ? activeLink : normalLink}
                    >
                        {link.icon}
                        <span className='capitalize'>
                            {link.name}
                        </span>
                    </NavLink>
                ))}        
            </div>
          ))}
        </div>
        </>)}      
    </div>
  )
}

export default Sidebar