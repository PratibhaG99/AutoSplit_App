import React from 'react';

const GroupHead = ({ gid, mobile }) => {


  return (
    <div className="container mx-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4">{groupName}</h1>
        <p className="text-xl mb-2">Total Balance: <span className="font-semibold">{(balance.to_take - balance.to_give).toFixed(2)}</span></p>
        <p className="text-lg text-green-600 mb-2">You Owe: {balance.to_give.toFixed(2)}</p>
        <p className="text-lg text-red-600 mb-4">You Are Owed: {balance.to_take.toFixed(2)}</p>

        <div className="flex space-x-4 mb-4">
          <button className="bg-blue-500 text-white px-4 py-2 rounded">Settle Up</button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded">Balances</button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded">Spendings</button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mt-4">
        <h2 className="text-2xl font-bold mb-4">Expenses</h2>
        {expenses.length > 0 ? (
          expenses.map(expense => (
            <div key={expense._id} className="border-b border-gray-200 py-4">
              <p className="text-lg font-semibold">{expense.name}</p>
              <p className="text-gray-600">{new Date(expense.date).toLocaleDateString()}</p>
              <p className="text-gray-800">Amount: {expense.amount}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-600">No expenses to show.</p>
        )}
      </div>
    </div>
  );
}

export default GroupHead;
