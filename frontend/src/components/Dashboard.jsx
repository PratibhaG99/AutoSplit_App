import React, { useState, useEffect } from 'react';
import { BsCash } from "react-icons/bs";
import axios from 'axios';
import balanceImage from '../assets/balance.jpeg';
import oweImage from '../assets/owe.jpeg'
import lentImage from '../assets/lent.jpeg';

const Dashboard = ({ groups }) => {
  const [mobile, setMobile] = useState('');
  const [totals, setTotals] = useState({ totalBalance: 0, to_take: 0, to_give: 0, paid: 0, get_paid: 0 });

  useEffect(() => {
    const fetchBalances = async () => {
      let totalBalance = 0;
      let totalToTake = 0;
      let totalToGive = 0;
      let paid = 0;
      let get_paid = 0;

      if (groups.length > 0) {
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
            if (response.status !== 201) {
              totalToGive -= response.data.to_give;
              totalToTake += response.data.to_take;
              paid += response.data.paid;
              get_paid += response.data.get_paid;
            }
          } catch (error) {
            console.error(`Error fetching balance for group ${group._id}:`, error.message);
          }
        }
      }

      totalBalance = totalToTake - totalToGive;
      setTotals({ totalBalance, to_take: totalToTake, to_give: totalToGive, paid: paid, get_paid: get_paid });
    };

    const loggedInUser = localStorage.getItem('loggedInUser');

    if (!loggedInUser) {
      navigate('/login'); // Navigate to login page if user data is not found
    } else {
      const user = JSON.parse(loggedInUser);
      setMobile(user.mobile);
      fetchBalances();
    }

  }, [groups]);

  return (
    <div>
      <h3 className="text-3xl font-medium text-gray-700 mb-6">Dashboard</h3>
      <div className="mt-4">
        <div className="flex flex-wrap -mx-6">
          <div className="w-full px-6 mb-6 sm:w-1/2 xl:w-1/3">
            <div className="flex items-center px-5 py-6 bg-gray-700 text-white rounded-lg shadow-md">
            <img src={ balanceImage } className="h-20 w-20"/>
              <div className="ml-5">
                <h4 className="text-2xl font-semibold">{totals.totalBalance.toFixed(2)}</h4>
                <div className="text-gray-300">Total Balance</div>
              </div>
            </div>
          </div>
          <div className="w-full px-6 mb-6 sm:w-1/2 xl:w-1/3">
            <div className="flex items-center px-5 py-6 bg-green-600 text-white rounded-lg shadow-md">
            <img src={ oweImage } className="h-20 w-20"/>
              <div className="ml-5">
                <h4 className="text-2xl font-semibold">{(totals.to_take - totals.paid).toFixed(2)}</h4>
                <div className="text-gray-200">You are Owed</div>
              </div>
            </div>
          </div>
          <div className="w-full px-6 mb-6 sm:w-1/2 xl:w-1/3">
            <div className="flex items-center px-5 py-6 bg-red-600 text-white rounded-lg shadow-md">
            <img src={ lentImage } className="h-20 w-20"/>
              <div className="ml-5">
                <h4 className="text-2xl font-semibold">{(totals.to_give - totals.get_paid).toFixed(2)}</h4>
                <div className="text-gray-200">You Owe</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
