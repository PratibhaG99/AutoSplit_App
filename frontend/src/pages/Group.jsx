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
    const fetchData = async () => {
      const token = localStorage.getItem('loggedInUser');
      const accessToken = JSON.parse(token);
  
      if (accessToken) {
        try {
          const user = await axios.get(`http://localhost:5555/user/getuser`, {
            headers: {
              'Authorization': `Bearer ${accessToken.accessToken}`
            }
          });
  
          setMobile(user.data.mobile);
          fetchGroupData(user.data.mobile);
          fetchGroupMembers();
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        navigate('/autosplit/login'); // Navigate to login page if user data is not found
      }
    };
  
    fetchData();
  }, [navigate, gid]);
  

  const fetchBalance=async (simplified)=>{
      const token = localStorage.getItem('loggedInUser');
      const accessToken = JSON.parse(token);
      const user = await axios.get(`http://localhost:5555/user/getuser`,{
        headers: {
            'Authorization': `Bearer ${accessToken.accessToken}`
        }
      });
      // setMobile(user.data.mobile);
    const balanceResponse = await axios.get(`http://localhost:5555/group/${gid}/${mobile}/${simplified}`,{
      headers: {
          'Authorization': `Bearer ${accessToken.accessToken}`
      }
    });   // to get balance of user
      if (balanceResponse.status === 200)
        setBalance(balanceResponse.data);
  }


  const fetchGroupData = async (mobile) => {
    try {
      const token = localStorage.getItem('loggedInUser');
      const accessToken = JSON.parse(token);
      const userShare = {}
      const groupResponse = await axios.get(`http://localhost:5555/group/${gid}`,{
        headers: {
            'Authorization': `Bearer ${accessToken.accessToken}`
        }
      });    //to get group info
      setGroupName(groupResponse.data.gname);
      setSmartSplitting(groupResponse.data.simplified)
      const balanceResponse = await axios.get(`http://localhost:5555/group/${gid}/${mobile}/${groupResponse.data.simplified}`,{
        headers: {
            'Authorization': `Bearer ${accessToken.accessToken}`
        }
      });   // to get balance of user
      if (balanceResponse.status === 200)
        setBalance(balanceResponse.data);

      const expensesResponse = await axios.get(`http://localhost:5555/group/${gid}/expenses`,{
        headers: {
            'Authorization': `Bearer ${accessToken.accessToken}`
        }
      });
      // console.log(expensesResponse)

      if (expensesResponse.status === 200) {
        setExpenses(expensesResponse.data);
        expensesResponse.data.forEach(expense => {
          let share = 0;
          expense.initial.forEach(list => {
            if (list['phone'] == mobile) {share = list['amount']}
          })
          userShare[expense._id] = share
        })
        setUserExpenses(userShare);
        return expensesResponse.data;
      }
    } catch (error) {
      console.error(`Error fetching group data:`, error.message);
    }
  };

  const fetchGroupMembers = async () => {
    try {
        const token = localStorage.getItem('loggedInUser');
        const accessToken = JSON.parse(token);
        const memberslist = {}
        const response = await axios.get(`http://localhost:5555/group/${gid}`,{
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
  const closeAddExpense = async () => {
    const exp= await fetchGroupData(mobile);
    if(smartSplitting)
    {
      await axios.delete(`http://localhost:5555/simplifiedExpense/${gid}`,{
        headers: {
            'Authorization': `Bearer ${accessToken.accessToken}`
        }
      });
      console.log(expenses)
      await axios.post(`http://localhost:5555/simplifiedExpense/${gid}`, exp,{
        headers: {
            'Authorization': `Bearer ${accessToken.accessToken}`
        }
      });
      await fetchBalance(smartSplitting);
    }
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

  const handleDeleteExpense = async (expenseId) => {
    // fetchGroupData(mobile);
    const exp= await fetchGroupData(mobile);
    if(smartSplitting)
    {
      const token = localStorage.getItem('loggedInUser');
      const accessToken = JSON.parse(token);
      await axios.delete(`http://localhost:5555/simplifiedExpense/${gid}`, {
        headers: {
            'Authorization': `Bearer ${accessToken.accessToken}`
        }
      });
      console.log(expenses)
      await axios.post(`http://localhost:5555/simplifiedExpense/${gid}`, exp, {
        headers: {
            'Authorization': `Bearer ${accessToken.accessToken}`
        }
      });
      await fetchBalance(smartSplitting);
    }
  };


  const toggleSmartSpliting = async () => {
    setSmartSplitting(prevSmartSplitting => {
      const newSmartSplitting = !prevSmartSplitting;
      // Use the new state value
      (async () => {
        // console.log(newSmartSplitting)
        const token = localStorage.getItem('loggedInUser');
        const accessToken = JSON.parse(token);
        if (newSmartSplitting) {
          await axios.put(`http://localhost:5555/simplifiedExpense/${gid}`, { simplified: true }, {
            headers: {
                'Authorization': `Bearer ${accessToken.accessToken}`
            }
          });
          await axios.post(`http://localhost:5555/simplifiedExpense/${gid}`, expenses, {
            headers: {
                'Authorization': `Bearer ${accessToken.accessToken}`
            }
          });
        } else {
          await axios.put(`http://localhost:5555/simplifiedExpense/${gid}`, { simplified: false }, {
            headers: {
                'Authorization': `Bearer ${accessToken.accessToken}`
            }
          });
          await axios.delete(`http://localhost:5555/simplifiedExpense/${gid}`, {
            headers: {
                'Authorization': `Bearer ${accessToken.accessToken}`
            }
          });
        }
        fetchBalance(!smartSplitting);
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
          .filter((key) => key !== 'to_take' && key !== 'to_give' && Math.abs(balance[key]) >= 0.01)
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
            <div
              className={`block w-14 h-8 rounded-full transition-colors ${
                smartSplitting ? 'bg-green-500' : 'bg-gray-400'
              }`}
            ></div>
            <div
              className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                smartSplitting ? 'translate-x-full' : ''
              }`}
            ></div>
          </label>
          <h4>Smart Split</h4>
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
              {expense.payer == mobile ? (
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
        <AddExpense gid={gid} smartSplitting={smartSplitting} onClose={closeAddExpense} />
      )}
      {showExpense && (
        <ShowExpense gid={gid}  expense={selectedExpense}  onClose={closeExpenseDialog} onDelete={handleDeleteExpense} />
      )}
    </div>
    </div>
  );
}

export default Group;
