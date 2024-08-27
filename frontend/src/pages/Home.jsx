import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import Dashboard from '../components/Dashboard';
import GroupCard from '../components/GroupCard';
import AddGroupDialog from './AddGroupDialog';
import EditGroupDialog from './EditGroupDialog';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import balanceImage from '../assets/balance.jpeg';
import oweImage from '../assets/owe.jpeg'
import lentImage from '../assets/lent.jpeg';

const Home = () => {
  const [groups, setGroups] = useState([]);
  const [showAddGroupDialog, setShowAddGroupDialog] = useState(false);
  const [showEditGroupDialog, setShowEditGroupDialog] = useState(false);
  const [mobile,setMobile]=useState('');
  const [to_take,settotake]=useState(0);
  const [to_give,settogive]=useState(0);
  const [taken,settaken]=useState(0);
  const [given,setgiven]=useState(0);
  const [editGroup, setEditGroup] = useState(null); // State to hold the group being edited
  const navigate = useNavigate();


  useEffect(() => {
    const token = localStorage.getItem('loggedInUser');
    const accessToken = JSON.parse(token);
    // setMobile(user.mobile);
    fetchGroups();
  }, [navigate]);

  const fetchGroups = async () => {
    const token = localStorage.getItem('loggedInUser');
    const accessToken = JSON.parse(token);
    axios.get(`http://localhost:5555/user/allgroups`,{
      headers: {
          'Authorization': `Bearer ${accessToken.accessToken}`
      }
    })
      .then((response) => {
        setGroups(response.data);
        let to_take=0,to_give=0,taken=0,given=0;
        if(response.data.length>0)
        response.data.forEach(async (group)=>{
          const expensesResponse = await axios.get(`http://localhost:5555/group/${group._id}/expenses`,{
            headers: {
                'Authorization': `Bearer ${accessToken.accessToken}`
            }
          });
          if(expensesResponse.status===200){expensesResponse.data.forEach((expense)=>{
             if(expense.type==='paid'){
                if(expense.payer===mobile) {
                  given+=expense.amount;
                }
                else {
                  expense.initial.forEach(payee => {
                    if (payee.phone === mobile) {
                      taken+=payee.amount;
                    }
                });
              }
             }
             else{
                if(expense.payer===mobile) {
                  to_give+=expense.amount;
                }
                else {
                  expense.initial.forEach(payee => {
                    if (payee.phone === mobile) {
                      to_take+=payee.amount;
                    }
                });
              }
             }
          })}
        })
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const openAddGroupDialog = () => {
    setShowAddGroupDialog(true);
  };

  const openEditGroupDialog = (group) => {
    setEditGroup(group);
    setShowEditGroupDialog(true);
  };

  const closeAddGroupDialog = () => {
    setShowAddGroupDialog(false);
  };

  const closeEditGroupDialog = () => {
    setShowEditGroupDialog(false);
  };

  const handleCreateGroup = () => {
    fetchGroups(JSON.parse(localStorage.getItem('loggedInUser')).mobile);
  };

  const handleDeleteGroup = () => {
    fetchGroups(JSON.parse(localStorage.getItem('loggedInUser')).mobile);
  };

  const handleEditGroup = () => {
    fetchGroups(JSON.parse(localStorage.getItem('loggedInUser')).mobile);
  };
  
  return (
    <div>
      <NavBar />
      <div className="flex flex-col justify-center px-6 md:px-20 py-10">
        
        <Dashboard groups={groups} />
        <div className="flex items-center justify-center">
        <button
          className="bg-green-500 text-white px-6 py-3 rounded-lg mb-6 hover:bg-green-600 transition duration-200 self-start ml-auto"
          onClick={openAddGroupDialog}
        >
          Add Group
        </button>
        </div>
        {groups.length > 0 ? (
          <GroupCard
            groups={groups}
            onGroupUpdated={handleEditGroup}
            onGroupDeleted={handleDeleteGroup}
            onEditGroup={openEditGroupDialog} // Pass the edit function to GroupCard
          />
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-md mt-6 border border-gray-200">
            <div className="card">
              <div className="card-content text-center">
                <h2 className="text-xl font-semibold text-gray-700">No groups to show</h2>
                <p className="text-gray-500 mt-2">It looks like you're not part of any groups yet. Start by creating a group!</p>
              </div>
            </div>
          </div>
        )}
      </div>
      {showAddGroupDialog && (
        <AddGroupDialog
          onClose={closeAddGroupDialog}
          onCreateGroup={handleCreateGroup}
        />
      )}
      {showEditGroupDialog && (
        <EditGroupDialog
          onClose={closeEditGroupDialog}
          onEditGroup={handleEditGroup}
          group={editGroup} // Pass the group to be edited
        />
      )}
    </div>














    //     :(
    //       <div className="bg-white p-6 rounded-lg shadow-md mt-4">
    //         <div className="card">
    //           <div className="card-content">
    //             <h2>No groups to show</h2>
    //             <p>It looks like you're not part of any groups yet. Start by creating a group!</p>
    //           </div>
    //         </div>
    //       </div>
    //     )} 
    //   </div>
    //   {showAddGroupDialog && (
    //     <AddGroupDialog 
    //       onClose={closeAddGroupDialog} 
    //       onCreateGroup={handleCreateGroup} 
    //     />
    //   )}
    //   {showEditGroupDialog && (
    //     <EditGroupDialog 
    //       onClose={closeEditGroupDialog} 
    //       onEditGroup={handleEditGroup} 
    //       group={editGroup} // Pass the group to be edited
    //     />
    //   )}
    // </div>
  );
};

export default Home;