import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddExpense from './AddExpense';
import Settleup from './Settleup';
import Balances from './Balances';
import Spendings from './Spendings';
import ShowExpense from './ShowExpense';
import NavBar from '../components/NavBar';

const Group = () => {
  const { gid } = useParams(); // Extracts the group ID from the URL
  const [mobile, setMobile] = useState('');
  const [groupName, setGroupName] = useState('');
  const [balance, setBalance] = useState({ to_take: 0, to_give: 0 });
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newExpense, setNewExpense] = useState({ name: '', amount: '', paidBy: '', split: '' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showBalances, setShowBalances] = useState(false);
  const [showSpendings, setShowSpendings] = useState(false);
  const [showExpense, setShowExpense] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [userExpenses, setUserExpenses] = useState({})
  const [memberlist, setMemberlist] = useState({});
  const [smartSplitting, setSmartSplitting] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    const loggedInUser = localStorage.getItem('loggedInUser');

    if (loggedInUser) {
      const user = JSON.parse(loggedInUser);
      setMobile(user.mobile);
      fetchGroupData(user.mobile);
      fetchGroupMembers();
    } else {
      navigate('/autosplit/login'); // Navigate to login page if user data is not found
    }
  }, [navigate, gid]);

  const fetchBalance=async ()=>{
    const balanceResponse = await axios.get(`http://localhost:5555/group/${gid}/${mobile}/${!smartSplitting}`);   // to get balance of user
      if (balanceResponse.status === 200)
        setBalance(balanceResponse.data);
      console.log(balanceResponse.data)
  }


  const fetchGroupData = async (mobile) => {
    try {
      const userShare = {}
      const groupResponse = await axios.get(`http://localhost:5555/group/${gid}`);    //to get group info
      setGroupName(groupResponse.data.gname);
      setSmartSplitting(groupResponse.data.simplified)
      const balanceResponse = await axios.get(`http://localhost:5555/group/${gid}/${mobile}/${groupResponse.data.simplified}`);   // to get balance of user
      if (balanceResponse.status === 200)
        setBalance(balanceResponse.data);

      const expensesResponse = await axios.get(`http://localhost:5555/group/${gid}/expenses`);
      if (expensesResponse.status === 200) {
        setExpenses(expensesResponse.data);
        expensesResponse.data.forEach(expense => {
          let share = 0;
          expense.initial.forEach(list => {
            if (list['phone'] === mobile) share = list['amount']
          })
          userShare[expense._id] = share
        })
        setUserExpenses(userShare);
      }
    } catch (error) {
      console.error(`Error fetching group data:`, error.message);
    }
  };

  const fetchGroupMembers = async () => {
    try {
        const memberslist = {}
        const response = await axios.get(`http://localhost:5555/group/${gid}`);
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

  const openDialog = () => {
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    fetchGroupData(mobile)
    setIsDialogOpen(false);
  };
  const func = () => {
    fetchGroupData(mobile)
  }

  const openBalancesDialog = () => {
    setShowBalances(true);
  };

  const closeBalancesDialog = () => {
    fetchGroupData(mobile);
    setShowBalances(false);
  };
  const closeAddExpense = () => {
    fetchGroupData(mobile);
    setShowModal(false);
  }

  const openSpendingsDialog = () => {
    setShowSpendings(true);
  };

  const closeSpendingsDialog = () => {
    setShowSpendings(false);
  };
  const openExpenseDialog = (expense) => {
    setSelectedExpense(expense);
    setShowExpense(true);
  };

  const closeExpenseDialog = () => {
    setShowExpense(false);
    setSelectedExpense(null);
  };

  const handleDeleteExpense = (expenseId) => {
    fetchGroupData(mobile);
  };

  // const toggleSmartSpliting=async ()=>{
  //   setSmartSplitting(!smartSplitting)
  //   console.log(smartSplitting)
    
  //   if(smartSplitting){
  //     const response = await axios.put(`http://localhost:5555/simplifiedExpense/${gid}`,{'simplified':true});
  //     const res = await axios.post(`http://localhost:5555/simplifiedExpense/${gid}`,expenses);

  //   }
  //   else{
  //     const response = await axios.put(`http://localhost:5555/simplifiedExpense/${gid}`,{'simplified':false});
  //     const res = await axios.delete(`http://localhost:5555/simplifiedExpense/${gid}`);
  //   }
  //   fetchBalance();
  // }
  const toggleSmartSpliting = async () => {
    setSmartSplitting(prevSmartSplitting => {
      const newSmartSplitting = !prevSmartSplitting;
      // Use the new state value
      (async () => {
        console.log(newSmartSplitting)
        if (newSmartSplitting) {
          await axios.put(`http://localhost:5555/simplifiedExpense/${gid}`, { simplified: true });
          await axios.post(`http://localhost:5555/simplifiedExpense/${gid}`, expenses);
          console.log("1")
        } else {
          await axios.put(`http://localhost:5555/simplifiedExpense/${gid}`, { simplified: false });
          await axios.delete(`http://localhost:5555/simplifiedExpense/${gid}`);
          console.log("3")
        }
        console.log("2")
        fetchBalance();
      })();
      return newSmartSplitting; // Return the new state value
    });
  };
  

  return (
    <div>
      <NavBar />
    
    <div className="container mx-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4">{groupName}</h1>
        <p className="text-xl mb-2">You <span className="font-semibold">{(balance.to_take + balance.to_give) > 0 ? `lent ${((balance.to_take + balance.to_give)).toFixed(2)}` : `owe ${(Math.abs((balance.to_take + balance.to_give))).toFixed(2)}`}</span></p>
        {Object.keys(balance)
          .filter((key) => key !== 'to_take' && key !== 'to_give' && balance[key] !== 0)
          .map((key) => (
            <p key={key} className="text-lg mb-2">
              {memberlist[key]} {balance[key] > 0 ? `owes ${(balance[key]).toFixed(2)}` : `lent ${(Math.abs(balance[key])).toFixed(2)}`}
            </p>
          ))}

        <div className="flex space-x-4 mb-4">
          <div>
            <button onClick={openDialog} className="bg-blue-500 text-white px-4 py-2 rounded">
              Settle Up
            </button>
            {isDialogOpen && <Settleup gid={gid} simplified={smartSplitting} onClose={closeDialog} />}
          </div>
          <div>
            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={openBalancesDialog}>Balances</button>
            {showBalances && <Balances gid={gid} simplified={smartSplitting} onClose={closeBalancesDialog} />}
          </div>
          <div>
            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={openSpendingsDialog}>Spendings</button>
            {showSpendings && <Spendings gid={gid} onClose={closeSpendingsDialog} expenses={expenses} user={mobile} />}
          </div>
          <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={() => setShowModal(true)}>Add Expense</button>
        </div>
        
        <div className="relative">
          <input
            type="checkbox"
            id="smartSplittingToggle"
            checked={smartSplitting}
            onChange={toggleSmartSpliting}
            className="sr-only"
          />
          <label htmlFor="smartSplittingToggle" className="flex items-center cursor-pointer">
            <div className="block bg-gray-400 w-14 h-8 rounded-full"></div>
            <div
              className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                smartSplitting ? 'translate-x-full' : ''
              }`}
            ></div>
          </label>
      </div>


      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mt-4">
        <h2 className="text-2xl font-bold mb-4">Expenses</h2>
        {expenses.length > 0 ? (
          expenses.map(expense => (
            <div key={expense._id} className="border-b border-gray-200 py-4" onClick={() => openExpenseDialog(expense)}>
              <p className="text-lg font-semibold">{expense.expenseName}</p>
              <p className="text-gray-600">{new Date(expense.createdAt).toLocaleDateString()}</p>
              <p className="text-gray-800">Amount: {expense.amount.toFixed(2)}</p>
              {expense.payer === mobile ? (
                <p className="text-green-600">You lent: {(expense.amount - userExpenses[expense._id]).toFixed(2)}</p>
              ) : (
                <p className="text-red-600">You borrowed: {userExpenses[expense._id].toFixed(2)}</p>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-600">No expenses to show.</p>
        )}
      </div>

      {showModal && (
        <AddExpense gid={gid} onClose={closeAddExpense} />
      )}
      {showExpense && (
        <ShowExpense gid={gid} expense={selectedExpense} onClose={closeExpenseDialog} onDelete={handleDeleteExpense} />
      )}
    </div>
    </div>
  );
}

export default Group;
