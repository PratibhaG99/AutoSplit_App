import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
          const user = await axios.get(`http://localhost:5555/user/getuser`,{
            headers: {
                'Authorization': `Bearer ${accessToken.accessToken}`
            }
          });
          setMobile(user.data.mobile);
          const response = await axios.get(`http://localhost:5555/group/${group._id}/${user.data.mobile}/${group.simplified}`,{
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

  return (
    <div className="mx-auto">
      {load ? (
        <div>
          {groups.map((item) => (
            <div className='py-2' key={item._id} onClick={() => navigate(`/autosplit/group/${item._id}`)}>
              <a className="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                <img className="object-cover w-full rounded-t-lg h-96 md:h-auto md:w-48 md:rounded-none md:rounded-s-lg" src="/docs/images/blog/image-4.jpg" alt="" />
                <div className="flex flex-col justify-between p-4 leading-normal">
                  <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{item.gname}</h5>
                  {!balances[item._id] ? (
                    <p>Loading...</p>
                  ) : balances[item._id].to_take + balances[item._id].to_give > 0 ? (
                    <p className="mb-3 font-normal text-green-700 dark:text-green-400">You are Owed {(balances[item._id].to_take + balances[item._id].to_give).toFixed(2)}</p>
                  ) : balances[item._id].to_take + balances[item._id].to_give < 0 ? (
                    <p className="mb-3 font-normal text-red-700 dark:text-red-400">You Owe {(Math.abs(balances[item._id].to_take + balances[item._id].to_give).toFixed(2))}</p>
                  ) : (
                    <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">You are all settled</p>
                  )}
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
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div />
      )}
    </div>
  );
};

export default GroupCard;
