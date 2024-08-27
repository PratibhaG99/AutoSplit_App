import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ShowExpense = ({ gid, expense, onClose, onDelete }) => {
  const { expenseName, payer, addedBy,amount, createdAt, initial, _id } = expense;
  const [memberlist, setMemberlist] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchGroupMembers();
  }, []);

  const fetchGroupMembers = async () => {
    try {
      const token = localStorage.getItem('loggedInUser');
      const accessToken = JSON.parse(token);
      const memberslist = {};
      const response = await axios.get(`http://localhost:5555/group/${gid}`, {
        headers: {
            'Authorization': `Bearer ${accessToken.accessToken}`
        }
      });
      const members = response.data.gmembers;
      if (response.status === 200) {
        const memberPromises = members.map(async (member) => {
          const memberDetail = await axios.get(`http://localhost:5555/user/${member}`);
          memberslist[member] = memberDetail.data.name;
        });

        await Promise.all(memberPromises);
        setMemberlist(memberslist);
      }
    } catch (error) {
      console.error('Error fetching group members:', error.message);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('loggedInUser');
      const accessToken = JSON.parse(token);
      const response = await axios.delete(`http://localhost:5555/expense/${_id}`, {
        headers: {
            'Authorization': `Bearer ${accessToken.accessToken}`
        }
      });
      if (response.status === 200) {
        onDelete(_id);
        onClose();
      }
    } catch (error) {
      console.error('Error deleting expense:', error.message);
    }
  };

  const handleConfirmDelete = () => {
    setShowConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-75" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg p-6 w-1/3 relative" onClick={(event) => event.stopPropagation()}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{expenseName}</h2>
        <button onClick={onClose} className="text-red-500 hover:text-red-700">
          &times;
        </button>
      </div>

      <div className="mb-4">
        <p className="text-lg">
          <span className="font-semibold">Paid by:  </span> 
          {Object.keys(memberlist).length === 0 ? (
            <span className="inline-block w-1/3 h-4 bg-gray-300 animate-pulse rounded ml-2"></span>
          ) : (
            memberlist[payer]
          )}
        </p>
        <p className="text-lg">
          <span className="font-semibold">Amount:   </span> 
          {Object.keys(memberlist).length === 0 ? (
            <span className="inline-block w-1/4 h-4 bg-gray-300 animate-pulse rounded ml-2"></span>
          ) : (
            amount
          )}
        </p>
        <p className="text-lg">
          <span className="font-semibold">Added by:  </span> 
          {Object.keys(memberlist).length === 0 ? (
            <span className="inline-block w-1/3 h-4 bg-gray-300 animate-pulse rounded ml-2"></span>
          ) : (
            memberlist[addedBy]
          )}
        </p>
        <p className="text-lg">
          <span className="font-semibold">Date:   </span> 
          {Object.keys(memberlist).length === 0 ? (
            <span className="inline-block w-1/4 h-4 bg-gray-300 animate-pulse rounded ml-2"></span>
          ) : (
            new Date(createdAt).toLocaleDateString()
          )}
        </p>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold">Shares:  </h3>
        {Object.keys(memberlist).length === 0 ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex justify-between items-center p-2 rounded-lg bg-gray-200 animate-pulse">
                <div className="w-1/3 h-4 bg-gray-300 rounded"></div>
                <div className="w-1/4 h-4 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          initial.map((payee, index) => (
            <div key={index} className="flex justify-between items-center p-2 rounded-lg bg-gray-100 mb-2">
              <span className="text-gray-700">{memberlist[payee.phone]}</span>
              <span className="text-gray-700">{payee.amount}</span>
            </div>
          ))
        )}
      </div>


        <div className="flex justify-end">
          <button
            className="bg-red-500 text-white px-4 py-2 rounded mr-2"
            onClick={handleConfirmDelete}
          >
            Delete
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-75">
            <div className="bg-white rounded-lg shadow-lg p-6 w-1/3 relative">
              <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
              <p className="text-lg mb-4">Are you sure you want to delete this expense?</p>
              <div className="flex justify-end">
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                  onClick={handleDelete}
                >
                  Delete
                </button>
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                  onClick={handleCancelDelete}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowExpense;
