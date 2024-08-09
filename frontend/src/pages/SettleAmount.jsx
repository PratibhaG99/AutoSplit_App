import React, { useState } from 'react';
import axios from 'axios';

const SettleAmount = ({ gid, memberPhone ,memberName, userPhone, userName, balance, onClose,onSettle }) => {
    const [amount, setAmount] = useState(Math.abs(balance));

    const handleSettle = async () => {
        const loggedInUser = localStorage.getItem('loggedInUser');
        const user = JSON.parse(loggedInUser);
        if (!loggedInUser) {
            navigate('/autosplit/login');
        } else {
            let newExpense = { groupId: gid, expenseName: 'Paid', addedBy:'', payer: '', amount: amount,initial:[], payees: [], type: 'paid' }
            newExpense.payer = balance>0 ? memberPhone : userPhone;
            const temp = balance>0 ? userPhone : memberPhone;
            newExpense.payees =  [{'phone':temp, 'amount':amount}]
            newExpense.initial =  [{'phone':temp, 'amount':amount}]
            newExpense.addedBy = userPhone;
            console.log(newExpense)
            try {
                const response = await axios.post(`http://localhost:5555/expense/`, newExpense);
                if (response.status === 201) {
                  onSettle();
                  onClose(); // Close the modal after successful addition
                }
              } catch (error) {
                console.error('Error adding expense:', error.message);
              }
        }
    };
    const formatAmount = (amount) => {
        return amount !== undefined ? amount.toFixed(2) : '0.00';
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-75" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-lg p-4 w-1/3 absolute right-0" onClick={(event) => event.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">{memberName}</h3>
                    <button onClick={onClose} className="text-red-500 hover:text-red-700">
                        &times;
                    </button>
                </div>
                <p className="mb-4">
                    {balance > 0 
                        ? `${memberName} is paying ${userName} `
                        : `${userName} is paying ${memberName}`}
                </p>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Amount:</label>
                    <input
                        type="number"
                        value={formatAmount(amount)}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={handleSettle}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Settle
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettleAmount;
