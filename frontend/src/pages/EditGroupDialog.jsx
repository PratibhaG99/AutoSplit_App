import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditGroupDialog = ({ group, onClose, onEditGroup }) => {
  const [groupName, setGroupName] = useState('');
  const [members, setMembers] = useState([]);
  const [checkedMobiles, setCheckedMobiles] = useState([]);

  useEffect(() => {
    if (group) {
      setGroupName(group.gname);
      fetchMembers(group);
    }
  }, [group]);

  const fetchMembers = async (group) => {
    const memlist = await Promise.all(
      group.gmembers.map(async (mobile) => {
        const response = await axios.get(`http://localhost:5555/user/${mobile}`);
        return {
          name: response.data.name,
          mobile: mobile
        };
      })
    );
    setMembers(memlist);
    setCheckedMobiles(memlist.map(() => true)); // Mark all initial members as checked
  };

  const checkMemberExists = async (mobile, index) => {
    try {
      const response = await axios.get(`http://localhost:5555/user/${mobile}`);
      const newMembers = [...members];
      if (response.data) {
        newMembers[index] = { ...newMembers[index], name: response.data.name };
        const newCheckedMobiles = [...checkedMobiles];
        newCheckedMobiles[index] = true;
        setMembers(newMembers);
        setCheckedMobiles(newCheckedMobiles);
      } else {
        newMembers[index] = { ...newMembers[index], name: '' };
      }
      // const newCheckedMobiles = [...checkedMobiles];
      // newCheckedMobiles[index] = true;
      setMembers(newMembers);
      // setCheckedMobiles(newCheckedMobiles);
    } catch (error) {
      console.error('Error checking member:', error.message);
    }
  };

  const handleMemberChange = (index, event) => {
    const { name, value } = event.target;
    const newMembers = [...members];
    newMembers[index][name] = value;
    setMembers(newMembers);
    if (name === 'mobile' && value.length === 10 && !checkedMobiles[index]) {
      checkMemberExists(value, index);
    } else if (name === 'mobile' && value.length !== 10) {
      const newCheckedMobiles = [...checkedMobiles];
      newCheckedMobiles[index] = false;
      setCheckedMobiles(newCheckedMobiles);
    }
  };

  const addMember = () => {
    setMembers([...members, { name: '', mobile: '' }]);
    setCheckedMobiles([...checkedMobiles, false]);
  };

  const removeMember = async (index) => {
    try{
      const member_to_remove=members[index].mobile;
      if(members.length<=1){
        alert("Group should have atleast 1 member.");
        return;
      }
      const indBal=[]
      const response = await axios.get(`http://localhost:5555/group/${group._id}/${member_to_remove}`);
      if (response.status === 200) {
          indBal[member_to_remove] = Object.keys(response.data)
          .filter(key => (response.data[key] !== 0 && key!='to_give' && key!='to_take'))
          .map(key => ({
              id: key
          }));
          if(indBal[member_to_remove].length>0)alert("Member cannot be removed due to remaining balance.");
          else{
            const newMembers = members.filter((_, i) => i !== index);
            setMembers(newMembers);
            const newCheckedMobiles = checkedMobiles.filter((_, i) => i !== index);
            setCheckedMobiles(newCheckedMobiles);
          }
      }
      else if(response.status === 201){
        const newMembers = members.filter((_, i) => i !== index);
        setMembers(newMembers);
        const newCheckedMobiles = checkedMobiles.filter((_, i) => i !== index);
        setCheckedMobiles(newCheckedMobiles);
      }
      
    }
    catch(error){
      console.log(error.message)
    }
    
  };

  const handleEditGroup = async () => {
    const uniqueMembers = [...new Set(members.map(member => Number(member.mobile)))];
    const updatedGroup = {
      _id: group._id,
      gname: groupName,
      gmembers: uniqueMembers,
    };
    console.log(updatedGroup)
    members.forEach(async (member)=>{
      const response = await axios.get(`http://localhost:5555/user/${member.mobile}`);
      if(!response.data) {
        try{
          const userr = {'name':member.name, 'mobile':member.mobile, 'password':''}
          const response = await axios.post('http://localhost:5555/user', userr);
        }
        catch {
          console.error('Error creating group:', error.message);
        }
      }
    })
    try {
      await axios.put(`http://localhost:5555/group/${group._id}`, updatedGroup);
      // console.log(updatedGroup)
      onEditGroup(updatedGroup);
      onClose();
    } catch (error) {
      console.error('Error updating group:', error.message);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md" onClick={(event) => event.stopPropagation()}>
        <h2 className="text-xl mb-4">Edit Group</h2>
        <div className="mb-4">
          <label className="block mb-2">Group Name:</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Members:</label>
          {members.map((member, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                name="mobile"
                value={member.mobile}
                onChange={(e) => handleMemberChange(index, e)}
                className="w-full px-3 py-2 border rounded"
                placeholder="Member Mobile"
              />
              <input
                type="text"
                name="name"
                value={member.name}
                onChange={(e) => handleMemberChange(index, e)}
                className={`w-full px-3 py-2 border rounded ${member.mobile.length === 10 && checkedMobiles[index] ? 'bg-gray-200' : ''}`}
                placeholder="Member Name"
                readOnly={member.mobile.length === 10 && checkedMobiles[index]}
              />
              <button
                onClick={() => removeMember(index)}
                className="ml-2 bg-red-500 text-white px-3 py-1 rounded"
              >
                Remove
              </button>
            </div>
          ))}
          <button onClick={addMember} className="bg-blue-500 text-white px-4 py-2 rounded">
            Add Member
          </button>
        </div>
        <div className="flex justify-end">
          <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded mr-2">
            Cancel
          </button>
          <button onClick={handleEditGroup} className="bg-green-500 text-white px-4 py-2 rounded">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditGroupDialog;
