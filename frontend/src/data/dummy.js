import React from 'react';
import { AiOutlineCalendar, AiOutlineShoppingCart, AiOutlineAreaChart, AiOutlineBarChart, AiOutlineStock, AiOutlineHome } from 'react-icons/ai';
import { TbFaceIdError } from "react-icons/tb";
import { FiEdit, FiPieChart, FiCreditCard } from 'react-icons/fi';
import { BsKanban, BsBarChart, BsCurrencyDollar, BsShield } from 'react-icons/bs';
import { BiColorFill } from 'react-icons/bi';
import { IoMdContacts } from 'react-icons/io';
import { RiStockLine } from 'react-icons/ri';
import { CgSmartHomeWashMachine } from "react-icons/cg";
import { GiRolledCloth } from "react-icons/gi";
import { SiStylelint } from "react-icons/si";
import { GiLouvrePyramid } from 'react-icons/gi';
import avatar from './avatar.jpg';

export const links = [
  {
    title: 'Dashboard',
    links: [
      {
        name: 'dashboard',
        icon: <AiOutlineHome />,
        roles: ["admin", "quality_manager"],
      },
    ],
  },

  {
    title: 'Pages',
    links: [
      {
        name: 'orders',
        icon: <AiOutlineShoppingCart />,
        roles: ["admin", "production_manager"],
      },
      {
        name: 'fabriclist',
        icon: <GiRolledCloth />,
        roles: ["admin", "quality_manager"],
      },
      {
        name: 'stylelist',
        icon: <SiStylelint />,
        roles: ["admin", "quality_manager"],
      },
      {
        name: 'defectslist',
        icon: <TbFaceIdError />,
        roles: ["admin", "quality_manager"],
      },
      {
        name: 'wash-recipe-list',
        icon: <CgSmartHomeWashMachine />,
        roles: ["admin", "wash_supervisor"],
      },
      {
        name: 'employees',
        icon: <IoMdContacts />,
      },
    ],
  },
  {
    title: 'Apps',
    links: [
      {
        name: 'calendar',
        icon: <AiOutlineCalendar />,
      },
      {
        name: 'kanban',
        icon: <BsKanban />,
      },
      {
        name: 'editor',
        icon: <FiEdit />,
      },
      {
        name: 'color-picker',
        icon: <BiColorFill />,
      },
    ],
  },
  {
    title: 'Charts',
    links: [
      {
        name: 'line',
        icon: <AiOutlineStock />,
        roles: ["admin", "quality_manager"],
      },
      {
        name: 'fabricCompositionChart',
        icon: <AiOutlineAreaChart />,
        roles: ["admin", "quality_manager"],
      },

      {
        name: 'reports/defects',
        icon: <AiOutlineBarChart />,
        roles: ["admin", "quality_manager"],
      },
      {
        name: 'defectComparison',
        icon: <FiPieChart />,
        roles: ["admin", "quality_manager"],
      },
      {
        name: 'washRecipeDashboard',
        icon: <RiStockLine />,
        roles: ["admin", "quality_manager"],
      },
      {
        name: 'wRDefectDashboard',
        icon: <BsBarChart />,
        roles: ["admin", "quality_manager"],
      },
      {
        name: 'pyramid',
        icon: <GiLouvrePyramid />,
      },
      {
        name: 'stacked',
        icon: <AiOutlineBarChart />,
      },
    ],
  },
];

export const themeColors = [
  {
    name: 'blue-theme',
    color: '#1A97F5',
  },
  {
    name: 'green-theme',
    color: '#03C9D7',
  },
  {
    name: 'purple-theme',
    color: '#7352FF',
  },
  {
    name: 'red-theme',
    color: '#FF5C8E',
  },
  {
    name: 'indigo-theme',
    color: '#1E4DB7',
  },
  {
    color: '#FB9678',
    name: 'orange-theme',
  },
];

export const userProfileData = [
  {
    icon: <BsCurrencyDollar />,
    title: 'My Profile',
    desc: 'Account Settings',
    iconColor: '#03C9D7',
    iconBg: '#E5FAFB',
  },
  {
    icon: <BsShield />,
    title: 'My Inbox',
    desc: 'Messages & Emails',
    iconColor: 'rgb(0, 194, 146)',
    iconBg: 'rgb(235, 250, 242)',
  },
  {
    icon: <FiCreditCard />,
    title: 'My Tasks',
    desc: 'To-do and Daily Tasks',
    iconColor: 'rgb(255, 244, 229)',
    iconBg: 'rgb(254, 201, 15)',
  },
];

export const lineChartData = [
  [
    { x: new Date(2005, 0, 1), y: 21 },
    { x: new Date(2006, 0, 1), y: 24 },
    { x: new Date(2007, 0, 1), y: 36 },
    { x: new Date(2008, 0, 1), y: 38 },
    { x: new Date(2009, 0, 1), y: 54 },
    { x: new Date(2010, 0, 1), y: 57 },
    { x: new Date(2011, 0, 1), y: 70 },
  ],
  [
    { x: new Date(2005, 0, 1), y: 28 },
    { x: new Date(2006, 0, 1), y: 44 },
    { x: new Date(2007, 0, 1), y: 48 },
    { x: new Date(2008, 0, 1), y: 50 },
    { x: new Date(2009, 0, 1), y: 66 },
    { x: new Date(2010, 0, 1), y: 78 },
    { x: new Date(2011, 0, 1), y: 84 },
  ],

  [
    { x: new Date(2005, 0, 1), y: 10 },
    { x: new Date(2006, 0, 1), y: 20 },
    { x: new Date(2007, 0, 1), y: 30 },
    { x: new Date(2008, 0, 1), y: 39 },
    { x: new Date(2009, 0, 1), y: 50 },
    { x: new Date(2010, 0, 1), y: 70 },
    { x: new Date(2011, 0, 1), y: 100 },
  ],
];
