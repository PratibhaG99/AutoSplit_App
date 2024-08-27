import React, { useEffect, useState } from 'react';
import EditProfile from '../pages/EditProfile';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import userImage from '../assets/user.png'

const NavBar = () => {

  const [user, setUser] = useState({});
  const [showEditDialog,setshowEditDialog]=useState(false);
  const navigate=useNavigate();
  useEffect(() => {
    const func = async ()=>{const token = localStorage.getItem('loggedInUser');
      const accessToken = JSON.parse(token);
      const user = await axios.get(`http://localhost:5555/user/getuser`,{
        headers: {
            'Authorization': `Bearer ${accessToken.accessToken}`
        }
      });
    setUser(user.data);
    const userMenuButton = document.getElementById("user-menu-button");
    const userDropdown = document.getElementById("user-dropdown");

    userMenuButton.addEventListener("click", () => {
      userDropdown.classList.toggle("hidden");
    });

    // Cleanup event listener
    return () => {
      userMenuButton.removeEventListener("click", () => {
        userDropdown.classList.toggle("hidden");
      });
    };}
    func();
  }, []);

  const EditProfileButton=()=>{
    setshowEditDialog(true);
  }
  const func=()=>{
    setshowEditDialog(false)
  }
  const SignOutButton=()=>{
    localStorage.removeItem('loggedInUser');
    navigate('/autosplit/login');
  }

  return (
    <div>
      <nav className="bg-white border-gray-200 dark:bg-gray-900">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4 relative">
          <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
            <img src="https://flowbite.com/docs/images/logo.svg" className="h-8" alt="Flowbite Logo" />
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">AutoSplit</span>
          </a>
          <div className="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            <button
              type="button"
              className="flex text-sm bg-gray-800 rounded-full md:me-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
              id="user-menu-button"
              aria-expanded="false"
            >
              <span className="sr-only">Open user menu</span>
              <img className="w-8 h-8 rounded-full" src={userImage} alt="user photo" />
            </button>
            <div
              className="z-50 hidden my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600 absolute top-full mt-2"
              id="user-dropdown"
            >
              <div className="px-4 py-3">
                <p className="block text-sm text-gray-900 dark:text-white">{user.name}</p>
                <p className="block text-sm text-gray-500 truncate dark:text-gray-400">{user.mobile}</p>
              </div>
              <ul className="py-2" aria-labelledby="user-menu-button">
                <li>
                  <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white" onClick={EditProfileButton}>Edit Profile</a>
                </li>
                <li>
                  <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white" onClick={SignOutButton}>Sign out</a>
                </li>
              </ul>
            </div>
            <button
              data-collapse-toggle="navbar-user"
              type="button"
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              aria-controls="navbar-user"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 17 14"
              >
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

        {showEditDialog && (<EditProfile user={user} onClose={func} />)}
    </div>
    
  );
};

export default NavBar;
