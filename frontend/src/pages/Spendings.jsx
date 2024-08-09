import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Spendings = ({ gid, onClose, expenses, user }) => {
  const [totalSpendings, setTotalSpendings] = useState(0);
  const [yourSpending, setyourSpending] = useState(0);
  const [yourShare, setyourShare] = useState(0);

  useEffect(() => {
    fetchTotalSpendings();
  }, []);

  const fetchTotalSpendings = async () => {
    let total = 0, yourspend=0, yoursh=0;
    expenses.forEach(element => {
      if(element.type!=="paid") {
          total = total + element.amount;
          if(element.payer===user) yourspend += element.amount;
          element.initial.forEach(item => {
            if(item.phone===user) yoursh += item.amount;
          });
        }
    });
    setTotalSpendings(total);
    setyourSpending(yourspend);
    setyourShare(yoursh);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-75" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg p-4 w-1/3 relative" onClick={(event) => event.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Total Spendings</h2>
          <button onClick={onClose} className="text-red-500 hover:text-red-700">
            &times;
          </button>
        </div>
        <div className="mb-4">
          <p className="text-xl">Total spendings of the group:</p>
          <p className="text-2xl font-bold">{totalSpendings}</p>
          <p className="text-xl">Your spendings of the group:</p>
          <p className="text-2xl font-bold">{yourSpending}</p>
          <p className="text-xl">Your share of the group:</p>
          <p className="text-2xl font-bold">{yourShare}</p>
        </div>
      </div>
    </div>
  );
};

export default Spendings;





// Your record submitted successfully
// Ref ID: 6166147
// Name = Dhiraj Pareek
// Email: pareekdhiraj97@gmail.com