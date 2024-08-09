import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import Dashboard from '../components/Dashboard';
import GroupCard from '../components/GroupCard';
import AddGroupDialog from './AddGroupDialog';
import EditGroupDialog from './EditGroupDialog';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
    const loggedInUser = localStorage.getItem('loggedInUser');
    const user = JSON.parse(loggedInUser);
    setMobile(user.mobile);
    if (!loggedInUser) {
      navigate('/autosplit/login'); // Navigate to login page if user data is not found
    } else {
      const user = JSON.parse(loggedInUser);
      const mobile = user.mobile;
      
      fetchGroups(mobile);
    }
  }, [navigate]);

  const fetchGroups = async (mobile) => {
    axios.get(`http://localhost:5555/user/allgroups/${mobile}`)
      .then((response) => {
        setGroups(response.data);
        let to_take=0,to_give=0,taken=0,given=0;
        response.data.forEach(async (group)=>{
          const expensesResponse = await axios.get(`http://localhost:5555/group/${group._id}/expenses`);
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
      <div className="flex flex-col justify-center px-20 py-10">
        <button
          className="bg-green-500 text-white px-4 py-2 rounded mb-4 self-start"
          onClick={openAddGroupDialog}
        >
          Add Group
        </button>
        <Dashboard groups={groups} />
        <GroupCard 
          groups={groups} 
          onGroupUpdated={handleEditGroup} 
          onGroupDeleted={handleDeleteGroup} 
          onEditGroup={openEditGroupDialog} // Pass the edit function to GroupCard
        />
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
      {/* {showEditProfile && (
        <EditGroupDialog 
          onClose={closeEditProfileDialog} 
          onEditProfile={handleEditProfile} 
          user={user} // Pass the user to be edited
        />
      )} */}
    </div>
  );
};

export default Home;