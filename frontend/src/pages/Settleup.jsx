import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SettleAmount from './SettleAmount';

const Settleup = ({ gid, simplified, onClose}) => {
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [balance, setBalance] = useState({});
    const [memberlist, setMemberlist] = useState({});
    const [selectedMember, setSelectedMember] = useState(null);
    const [selectedBalance, setSelectedBalance] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // const token = localStorage.getItem('loggedInUser');
        // const accessToken = JSON.parse(token);
        
        // if (!accessToken) {
        //     navigate('/autosplit/login');
        // } else {
        //     const user = 
        //     setPhone(user.mobile);
        //     setName(user.name);
        // }
        // fetchGroupMembers();

        // if (phone) {
        //     fetchBalances();
        // }


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
        
                setPhone(user.data.mobile);
                setName(user.data.name);
                fetchGroupMembers();

                if (phone) {
                    fetchBalances();
                }
              } catch (error) {
                console.error('Error fetching user data:', error);
              }
            } else {
              navigate('/autosplit/login'); // Navigate to login page if user data is not found
            }
          };
        
          fetchData();


    }, [phone, gid, navigate]);

    const fetchBalances = async () => {
        try {
            const token = localStorage.getItem('loggedInUser');
            const accessToken = JSON.parse(token);

            if (simplified) {
                await axios.delete(`http://localhost:5555/simplifiedExpense/${gid}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken.accessToken}`
                    }
                  });

                  const expensesResponse = await axios.get(`http://localhost:5555/group/${gid}/expenses`,{
                    headers: {
                        'Authorization': `Bearer ${accessToken.accessToken}`
                    }
                  });

                  const expenses= expensesResponse.data;

                await axios.post(`http://localhost:5555/simplifiedExpense/${gid}`, expenses, {
                  headers: {
                      'Authorization': `Bearer ${accessToken.accessToken}`
                  }
                });
              }

            const response = await axios.get(`http://localhost:5555/group/${gid}/${phone}/${simplified}`, {
                headers: {
                  'Authorization': `Bearer ${accessToken.accessToken}`
                }
              });
            if (response.status === 200) {
                setBalance(response.data);
            }
        } catch (error) {
            console.error('Error fetching balances:', error.message);
        }
    };

    const fetchGroupMembers = async () => {
        try {
            const memberslist = {}
            const token = localStorage.getItem('loggedInUser');
            const accessToken = JSON.parse(token);
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

    const handleMemberClick = (key, balance) => {
        setSelectedMember(key);
        setSelectedBalance(balance);
    };

    const handleCloseSecondDialog = () => {
        setSelectedMember(null);
        setSelectedBalance(null);
    };

    const dialog_closing=()=>{
        onClose();
    }
    const formatAmount = (amount) => {
        return amount !== undefined ? amount.toFixed(2) : '0.00';
    };
    const relevantBalances = Object.keys(balance).filter(
        (key) => key !== 'to_take' && key !== 'to_give' && balance[key] !== 0
      );

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-75" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-lg p-4 w-1/3 relative" onClick={(event) => event.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Settle Up</h2>
                    <button onClick={dialog_closing} className="text-red-500 hover:text-red-700">
                        &times;
                    </button>
                </div>

                {relevantBalances.length > 0 ? 
                (<div className="mb-4">
                    {Object.keys(balance).map((key) => (
                        key !== 'to_take' && key !== 'to_give' && Math.abs(balance[key]) >= 0.01 ? (
                            <div 
                                key={key} 
                                className={`flex justify-between items-center p-2 rounded-lg ${balance[key] > 0 ? 'bg-green-100' : 'bg-red-100'} mb-2 cursor-pointer`}
                                onClick={() => handleMemberClick(key, balance[key])}
                            >
                                <span className="text-gray-700">{memberlist[key]}</span>
                                <span className={`text-sm ${balance[key] > 0 ? 'text-green-700' : 'text-red-700'}`}>
                                    {balance[key] > 0 
                                        ? `You lent ${formatAmount(balance[key])}`
                                        : `You owe ${formatAmount(Math.abs(balance[key]))}`}
                                </span>
                            </div>
                        ) : null
                    ))}
                </div> )
                : <p className="text-gray-600">You Are all Settled up.</p> }

                <div className="flex justify-between">
                    <span className="text-green-500">Total Lent: {formatAmount(balance.to_take)}</span>
                    <span className="text-red-500">Total Owe: {formatAmount(balance.to_give)}</span>
                </div>

                {selectedMember && selectedBalance !== null && (
                    <SettleAmount 
                        gid = {gid}
                        memberPhone = {selectedMember}
                        memberName={memberlist[selectedMember]}
                        userPhone={phone}
                        userName={name} 
                        balance={selectedBalance} 
                        onClose={handleCloseSecondDialog}
                        onSettle={fetchBalances}
                    />
                )}
            </div>
        </div>
    );
}

export default Settleup;
