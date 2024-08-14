// src/components/AddExpenseModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SplitType from './SplitType';

const AddExpenseModal = ({ gid, smartSplitting , onClose }) => {
  const [newExpense, setNewExpense] = useState({ groupId: gid, expenseName: '', addedBy: '', payer: '', amount: '',initial:[], payees: [], type: 'equal' });
  const [groupMembers, setGroupMembers] = useState([]);
  const [isSplitDialogVisible, setIsSplitDialogVisible] = useState(false);
  const [selectedPayees, setSelectedPayees] = useState([]);
  const [splitOption, setSplitOption] = useState('equal');
  const [memberlist,setMemberlist]=useState({});
  const [expenseType, setExpenseType] = useState('travel');
  const [errors,setErrors]=useState({});

  useEffect(() => {
    fetchGroupMembers();
  }, []);

  const fetchGroupMembers = async () => {
    try {
      const loggedInUser = localStorage.getItem('loggedInUser');
      const user = JSON.parse(loggedInUser);
      const mobile = user.mobile;
      setNewExpense({ ...newExpense, ['addedBy']: String(mobile) });
      const memberslist = {}
      const response = await axios.get(`http://localhost:5555/group/${gid}`);
      const members = response.data.gmembers;
      if (response.status === 200) {
        setGroupMembers(members);
        setSelectedPayees(members.map((member) => ({ member, value: '' })));

        const memberPromises = members.map(async (member) => {
            const memberDetail = await axios.get(`http://localhost:5555/user/${member}`);
            memberslist[member] = memberDetail.data.name;
          });
    
          // Wait for all promises to complete
          await Promise.all(memberPromises);
          setMemberlist(memberslist)
      }
    } catch (error) {
      console.error('Error fetching group members:', error.message);
    }
  };

  const handleExpenseTypeChange = (e) => {
    setExpenseType(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense({ ...newExpense, [name]: value });
  };

  const handleAddExpense = async () => {
    let newErrors={}
    let valid=true

    if(newExpense.expenseName.length==0) {
      newErrors.expenseName=('Expense Name can not be empty')
      valid=false
    }

    if(newExpense.amount.length==0 || newExpense.amount==0) {
      newErrors.amount=('Amount can not be empty')
      valid=false
    }

    if(newExpense.payer.length==0) {
      newErrors.payer=('Choose payer')
      valid=false
    }

    if(newExpense.payees.length==0) {
      newErrors.payees=('Choose payees')
      valid=false
    }
    
    setErrors(newErrors)
    if(!valid) {
      return
    }

    const tempinitial = [];
    newExpense.payees.forEach(element => {
        let temp = { phone: '', amount: '' };
        temp['phone'] = element.member;
        temp['amount'] = element.value;
        tempinitial.push(temp);
    });
    newExpense.payees = tempinitial

  const updatedExpense = { ...newExpense, type: expenseType, initial: [...newExpense.payees] };

  updatedExpense.payees = updatedExpense.payees.filter(payee => (payee.phone != updatedExpense.payer) && (payee.amount > 0));

  try {
    const response = await axios.post(`http://localhost:5555/expense/`, updatedExpense);
    if (response.status === 201) {
      onClose(); // Close the modal after successful addition
    }
  } catch (error) {
    console.error('Error adding expense:', error.message);
  }
};

  const handleSplitChange = () => {
    setIsSplitDialogVisible(true);
  };

  const confirmPayees = (selectedPayees) => {
    setNewExpense({ ...newExpense, payees: selectedPayees });
    setIsSplitDialogVisible(false);
  };

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto" onClick={onClose}>
      <div className="flex items-center justify-center min-h-screen px-4 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Add Expense</h3>
                <div className="mt-2">
                  <input
                    type="text"
                    name="expenseName"
                    placeholder="Expense Name"
                    value={newExpense.expenseName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.expenseName && (<p className="text-red-500 text-xs mt-1">{errors.expenseName}</p> )}
                  <input
                    type="number"
                    name="amount"
                    placeholder="Amount"
                    value={newExpense.amount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 mt-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.amount && (<p className="text-red-500 text-xs mt-1">{errors.amount}</p> )}
                   <label className="block text-gray-700">Expense Type</label>
                    <select
                    name="expenseType"
                    value={expenseType}
                    onChange={handleExpenseTypeChange}
                    className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                    <option value="travel">Travel</option>
                    <option value="shopping">Shopping</option>
                    <option value="stay">Stay</option>
                    <option value="food">Food</option>
                    </select>
                  <div className="mt-4">
                    <label className="block text-gray-700">Paid By</label>
                    <select
                        name="payer"
                        value={newExpense.payer}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="" disabled>Select a member</option>
                        {groupMembers.map((member, index) => (
                        <option key={index} value={member}>
                            {memberlist[member]}
                        </option>
                        ))}
                    </select>
                    {errors.payer && (<p className="text-red-500 text-xs mt-1">{errors.payer}</p> )}
                    </div>

                  <div className="mt-4">
                    <label className="block text-gray-700">Split</label>
                    <div className="flex space-x-4 mt-2">
                      <button
                        type="button"
                        className={`px-4 py-2 rounded-lg ${
                          newExpense.type === 'equal'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                        onClick={handleSplitChange}
                      >
                        Split Type
                      </button>
                      {errors.payees && (<p className="text-red-500 text-xs mt-1">{errors.payees}</p> )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-500 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={handleAddExpense}
            >
              Add
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
        {isSplitDialogVisible && (
            // <SplitType groupMembers={groupMembers} amount={newExpense.amount} />
            <SplitType
              groupMembers={groupMembers}
              amount={newExpense.amount}
              memberlist={memberlist}
              onConfirm={confirmPayees}
              onClose={() => setIsSplitDialogVisible(false)}
            />
          )}
      </div>
    </div>
  );
};

export default AddExpenseModal;
