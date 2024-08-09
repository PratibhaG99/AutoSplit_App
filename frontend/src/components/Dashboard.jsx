import React, { useState, useEffect } from 'react';
import { BsCash } from "react-icons/bs";
import axios from 'axios';

const Dashboard = ({ groups }) => {
  const [balances, setBalances] = useState({});
  const [mobile, setMobile] = useState('');
  const [load, setLoaded] = useState(false);
  const [totals, setTotals] = useState({ totalBalance: 0, to_take: 0, to_give: 0 });

  useEffect(() => {
    const fetchBalances = async () => {
      const balancesTemp = {};
      let totalBalance = 0;
      let totalToTake = 0;
      let totalToGive = 0;
      
      for (const group of groups) {
        try {
          const response = await axios.get(`http://localhost:5555/group/${group._id}/${mobile}/${group.simplified}`);
          if (response.status !== 201) {
            totalToGive -= response.data.to_give;
            totalToTake += response.data.to_take;
          }
        } catch (error) {
          console.error(`Error fetching balance for group ${group._id}:`, error.message);
        }
      }

      totalBalance = totalToTake - totalToGive;

      setTotals({ totalBalance, to_take: totalToTake, to_give: totalToGive });
      setLoaded(true);
    };

    const loggedInUser = localStorage.getItem('loggedInUser');

    if (!loggedInUser) {
      navigate('/login'); // Navigate to login page if user data is not found
    } else {
      const user = JSON.parse(loggedInUser);
      const mobile = user.mobile;
      setMobile(mobile);
      fetchBalances();
    }

  }, [groups]);

  return (
<div>
  <h3 className="text-3xl font-medium text-gray-700">Dashboard</h3>

  <div className="mt-4">
    <div className="flex flex-wrap -mx-6">
      <div className="w-full px-6 sm:w-1/2 xl:w-1/3">
        <div className="flex items-center px-5 py-6 bg-gray-700 rounded-md shadow-sm">
            <BsCash className=""></BsCash>
          <div className="mx-5">
            <h4 className="text-2xl font-semibold text-white">{totals.totalBalance.toFixed(2) } </h4>
            <div className="text-gray-400">Total Balance</div>
          </div>
        </div>
      </div>

      <div className="w-full px-6 mt-6 sm:w-1/2 xl:w-1/3 sm:mt-0">
        <div className="flex items-center px-5 py-6 bg-gray-700 rounded-md shadow-sm">
        <BsCash className=""></BsCash>
          <div className="mx-5">
            <h4 className="text-2xl font-semibold text-green-500"> {totals.to_take.toFixed(2)} </h4>
            <div className="text-gray-400">You Owe</div>
          </div>
        </div>
      </div>

      <div className="w-full px-6 mt-6 sm:w-1/2 xl:w-1/3 xl:mt-0">
        <div className="flex items-center px-5 py-6 bg-gray-700 rounded-md shadow-sm">
        <BsCash className=""></BsCash>
          <div className="mx-5">
            <h4 className="text-2xl font-semibold text-red-500"> {totals.to_give.toFixed(2)} </h4>
            <div className="text-gray-400">You are Owed</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div className="mt-8"></div>
</div>

  )
}

export default Dashboard