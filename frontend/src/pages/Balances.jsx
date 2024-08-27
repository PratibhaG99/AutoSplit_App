import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SettleAmount from './SettleAmount';

const Balances = ({ gid, simplified, onClose }) => {
    const [memberBalances, setMemberBalances] = useState([]);
    const [individualBalances, setIndividualBalances] = useState({});
    const [selectedMember, setSelectedMember] = useState(null);
    const [showSettleUp, setShowSettleUp] = useState(false);
    const [currentBalance, setCurrentBalance] = useState({});
    const [currentMemberName, setCurrentMemberName] = useState('');
    const [memberlist, setMemberlist] = useState({});
    const [isMemberListFetched, setIsMemberListFetched] = useState(false);
    const [loading, setloading] = useState(false);

    useEffect(() => {
        setloading(true);
        fetchGroupMembers();
    }, []);

    useEffect(() => {
        if (isMemberListFetched) {
            fetchBalances();
        }
    }, [isMemberListFetched]);

    const fetchGroupMembers = async () => {
        try {
            const token = localStorage.getItem('loggedInUser');
            const accessToken = JSON.parse(token);
            const memberslist = {}
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
                setIsMemberListFetched(true); 
            }
        } catch (error) {
            console.error('Error fetching group members:', error.message);
        }
    };

    const fetchBalances = async () => {
        try {
            const balances = [];
            const indBal = {};
            const token = localStorage.getItem('loggedInUser');
            const accessToken = JSON.parse(token);
            for (const member in memberlist) {
                const response = await axios.get(`http://localhost:5555/group/${gid}/${member}/${simplified}`, {
                    headers: {
                      'Authorization': `Bearer ${accessToken.accessToken}`
                    }
                  });
                if (response.status === 200) {
                    balances.push({
                        id: member,
                        name: memberlist[member],
                        balance: response.data
                    });
                    indBal[member] = Object.keys(response.data)
                    .filter(key => (response.data[key] !== 0 && key!='to_give' && key!='to_take' && key!='paid' && key!='get_paid'))
                    .map(key => ({
                        id: key,
                        amount: response.data[key]
                    }));
                }
            }
            setMemberBalances(balances);
            setIndividualBalances(indBal);
            setloading(false);
        } catch (error) {
            console.error('Error fetching balances:', error.message);
        }
    };


    const handleMemberClick = async (member) => {
        if (individualBalances[member.id]) {
            setSelectedMember(selectedMember === member.id ? null : member.id);
        }
    };

    const handleSettleUp = (id, amount) => {
        setCurrentBalance(amount);
        setCurrentMemberName(id);
        setShowSettleUp(true);
    };

    const handleCloseSecondDialog = () => {
        setCurrentMemberName(null);
        setCurrentBalance(null);
        setShowSettleUp(false);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-75" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-lg p-4 w-1/3 relative" onClick={(event) => event.stopPropagation()}>
                <div className="flex justify-between items-center mb-4" >
                    <h2 className="text-xl font-bold">Balances</h2>
                    <button onClick={onClose} className="text-red-500 hover:text-red-700">
                        &times;
                    </button>
                </div>

                {loading ? (<div className="space-y-2">

                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="flex justify-between items-center p-2 rounded-lg bg-gray-200 animate-pulse">
                            <div className="w-1/3 h-4 bg-gray-300 rounded"></div>
                            <div className="w-1/4 h-4 bg-gray-300 rounded"></div>
                        </div>
                    ))}

                </div>) : (memberBalances.length ? 
                <div className="mb-4">
                    {memberBalances.map(member => (
                        (member.balance.to_take + member.balance.to_give) !== 0 && (
                            <div key={member.id}>
                                <div
                                    className={`flex justify-between items-center p-2 rounded-lg ${(member.balance.to_take + member.balance.to_give) > 0 ? 'bg-green-100' : 'bg-red-100'} mb-2 cursor-pointer`}
                                    onClick={() => handleMemberClick(member)}
                                >
                                    <span className={`text-sm ${(member.balance.to_take + member.balance.to_give) > 0 ? 'text-green-700' : 'text-red-700'}`}>
                                        {member.name} {(member.balance.to_take + member.balance.to_give) > 0 ? `gets back ${(member.balance.to_take + member.balance.to_give).toFixed(2)}` : `owes ${(Math.abs(member.balance.to_take + member.balance.to_give)).toFixed(2)}`}
                                    </span>
                                </div>
                                {selectedMember === member.id && (
                                    (<div className="ml-4">
                                        {individualBalances[member.id] && individualBalances[member.id].map(balance => (
                                            balance.amount !== 0 && (
                                                <div key={balance.id} className="flex justify-between items-center p-2 rounded-lg bg-gray-100 mb-2">
                                                    <span className={`text-sm ${balance.amount > 0 ? 'text-green-700' : 'text-red-700'}`}>
                                                        {memberlist[balance.id]} {balance.amount > 0 ? `owes ${(balance.amount).toFixed(2)}` : `gets back ${Math.abs(balance.amount).toFixed(2)}`}
                                                    </span>
                                                    <button
                                                        className="bg-blue-500 text-white px-2 py-1 rounded"
                                                        onClick={() => handleSettleUp(balance.id, balance.amount)}
                                                    >
                                                        Settle Up
                                                    </button>
                                                </div>
                                            )
                                        ))}
                                    </div>) 
                                )}
                            </div>
                        )
                    ))}
                </div>
                : <p className="text-gray-600">You Are all Settled up.</p>) }


                {showSettleUp && (
                    <SettleAmount 
                        gid = {gid}
                        memberPhone = {currentMemberName}
                        memberName={memberlist[currentMemberName]}
                        userPhone={selectedMember}
                        userName={memberlist[selectedMember]} 
                        balance={currentBalance} 
                        onClose={handleCloseSecondDialog}
                        onSettle={fetchBalances}
                    />
                )}

            </div>
        </div>
    );
};

export default Balances;