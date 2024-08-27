import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import groupImage from '../assets/group.png';

const GroupCard = ({ groups, onGroupDeleted, onGroupUpdated, onEditGroup }) => {
  const [balances, setBalances] = useState({});
  const [mobile, setMobile] = useState('');
  const [load, setLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBalances = async () => {
      const balancesTemp = {};
      for (const group of groups) {
        try {
          const token = localStorage.getItem('loggedInUser');
          const accessToken = JSON.parse(token);
          const user = await axios.get(`http://localhost:5555/user/getuser`, {
            headers: {
              'Authorization': `Bearer ${accessToken.accessToken}`
            }
          });
          setMobile(user.data.mobile);
          const response = await axios.get(`http://localhost:5555/group/${group._id}/${user.data.mobile}/${group.simplified}`, {
            headers: {
              'Authorization': `Bearer ${accessToken.accessToken}`
            }
          });
          if (response.status === 201) {
            balancesTemp[group._id] = { to_take: 0, to_give: 0 };
          } else {
            balancesTemp[group._id] = response.data;
          }
        } catch (error) {
          console.error(`Error fetching balance for group ${group._id}:`, error.message);
        }
      }
      setBalances(balancesTemp);
    };

    const loggedInUser = localStorage.getItem('loggedInUser');
    
    if (!loggedInUser) {
      navigate('/autosplit/login');
    } else {
      const user = JSON.parse(loggedInUser);
      const mobile = user.mobile;
      setMobile(mobile);
      fetchBalances();
      setLoaded(true);
    }
  }, [groups, navigate]);

  const handleDeleteGroup = async (groupId) => {
    const confirmation = window.confirm("Are you sure you want to delete this group?");
    if (confirmation) {
      try {
        await axios.delete(`http://localhost:5555/group/${groupId}`);
        onGroupDeleted(groupId);
      } catch (error) {
        console.error(`Error deleting group ${groupId}:`, error.message);
      }
    }
  };

  const getInitials = (name) => {
    const initials = name.split(' ').map(word => word[0]).join('');
    return initials.toUpperCase();
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {load ? (
        groups.map((item) => (
          <div
            key={item._id}
            className="bg-white border border-gray-200 rounded-lg shadow-md hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 cursor-pointer"
            onClick={() => navigate(`/autosplit/group/${item._id}`)}
          >
            <div className="flex items-center justify-center">
            {/* <div className="flex items-center justify-center w-20 h-20 rounded-full text-white text-2xl font-bold">
                  {getInitials(item.gname)}
                </div> */}
                <img src={ groupImage } className="h-40 w-40"/>
            </div>
            <div className="p-4 items-center justify-center" >
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white text-center">
                {item.gname}
              </h5>
              {!balances[item._id] ? (
                <p>Loading...</p>
              ) : balances[item._id].to_take + balances[item._id].to_give > 0 ? (
                <p className="mb-3 font-normal text-green-700 dark:text-green-400 text-center">
                  You are Owed {(balances[item._id].to_take + balances[item._id].to_give).toFixed(2)}
                </p>
              ) : balances[item._id].to_take + balances[item._id].to_give < 0 ? (
                <p className="mb-3 font-normal text-red-700 dark:text-red-400 text-center">
                  You Owe {Math.abs(balances[item._id].to_take + balances[item._id].to_give).toFixed(2)}
                </p>
              ) : (
                <p className="mb-3 font-normal text-gray-700 dark:text-gray-400 text-center">
                  You are all settled
                </p>
              )}
              <div className="flex justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteGroup(item._id);
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Delete
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditGroup(item);
                  }}
                  className="bg-yellow-500 text-white px-4 py-2 rounded ml-2"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div />
      )}
    </div>
  );
};

export default GroupCard;
