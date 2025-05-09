import React, { createContext, useContext, useState } from 'react'

const StateContext = createContext();

const initialState = {
    chat: false,
    cart: false,
    userProfile: false,
    notification: false
}

export const ContextProvider = ({ children }) => {

    const [activeMenu, setActiveMenu] = useState(true);
    const [isClicked, setIsClicked] = useState(initialState);
    const [screenSize, setScreenSize] = useState(undefined);
    const [currentColor, setCurrentColor] = useState('#03C9D7');
    const [currentMode, setCurrentMode] = useState('Light');
    const [themeSettings, setThemeSettings] = useState(false);
    const [isMenu, setIsMenu] = useState(true);

    const washTypeColors = {
        "Size Set": "bg-green-100 text-green-700",
        "Production": "bg-blue-100 text-blue-700",
        "SMS": "bg-yellow-100 text-yellow-700",
      };

    const setMode = (e) => {
        setCurrentMode(e.target.value);
        localStorage.setItem('themeMode', e.target.value);
        setThemeSettings(false);
    }

    const setColor = (color) => {
        setCurrentColor(color);
        localStorage.setItem('colorMode', color);
        setThemeSettings(false);
    }

    const handleClick = (name) => {
        setIsClicked({ ...initialState, [name]: true });
    }
    return (
        <StateContext.Provider value={{ 
            activeMenu, 
            setActiveMenu, 
            isClicked, 
            setIsClicked,
            handleClick,
            screenSize, 
            setScreenSize, 
            currentColor, 
            //setCurrentColor, 
            currentMode, 
            //setCurrentMode, 
            themeSettings, 
            setThemeSettings,
            isMenu,
            setIsMenu,
            setMode,
            setColor,
            washTypeColors
        }}>
            {children}
        </StateContext.Provider>
    )
}

export const useStateContext = () => useContext(StateContext);