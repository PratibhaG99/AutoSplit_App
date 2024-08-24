import React, { useState } from 'react';
import axios from 'axios';

const AddGroupDialog = ({ onClose, onCreateGroup }) => {
  const [groupName, setGroupName] = useState('');
  const [members, setMembers] = useState([{ name: '', mobile: '' }]);
  const [groupNameError, setGroupNameError] = useState('');
  const [memberErrors, setMemberErrors] = useState([]);

  const handleMemberChange = (index, event) => {
    const { name, value } = event.target;
    const newMembers = [...members];
    newMembers[index][name] = value;
    setMembers(newMembers);
  };

  const addMember = () => {
    setMembers([...members, { name: '', mobile: '' }]);
    setMemberErrors([...memberErrors, { name: '', mobile: '' }]);
  };

  const removeMember = (index) => {
    const newMembers = members.filter((_, i) => i !== index);
    setMembers(newMembers);
    const newErrors = memberErrors.filter((_, i) => i !== index);
    setMemberErrors(newErrors);
  };

  const handleCreateGroup = async () => {
    let valid = true;

    // Validate group name
    if (groupName.trim() === '') {
      setGroupNameError('Group name is required.');
      valid = false;
    } else {
      setGroupNameError('');
    }

    // Validate members
    const newErrors = members.map(member => {
      let nameError = '';
      let mobileError = '';
      if (member.name.trim() === '') {
        nameError = 'Member name is required.';
        valid = false;
      }
      if (member.mobile.trim() === '') {
        mobileError = 'Mobile number is required.';
        valid = false;
      } else if (member.mobile.length !== 10) {
        mobileError = 'Mobile number must be exactly 10 digits.';
        valid = false;
      }
      else if (!/^\d{10}$/.test(member.mobile)) {
        mobileError = "Mobile number must be exactly 10 digits and contain only numbers";
        valid = false;
      }
      return { name: nameError, mobile: mobileError };
    });
    setMemberErrors(newErrors);

    if (!valid) {
      return;
    }

    const token = localStorage.getItem('loggedInUser');
    const accessToken = JSON.parse(token);

    members.forEach(async (member) => {
      const response = await axios.get(`http://localhost:5555/user/${member.mobile}`);
      if (!response.data) {
        try {
          const userr = { name: member.name, mobile: member.mobile, password: '' };
          await axios.post('http://localhost:5555/user', userr);
        } catch (error) {
          console.error('Error creating user:', error.message);
        }
      }
    });

    const uniqueMembers = new Set([...members.map(member => member.mobile)]);
    const newGroup = { gname: groupName, gmembers: Array.from(uniqueMembers) };
    console.log(accessToken.accessToken)
    try { 
      const response = await axios.post('http://localhost:5555/group', newGroup , {
        headers: {
          'Authorization': `Bearer ${accessToken.accessToken}`
        }
      });
      if (response.status === 201) {
        onCreateGroup(response.data);
        onClose();
      }
    } catch (error) {
      console.error('Error creating group:', error.message);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-75" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg p-6 w-1/3 relative" onClick={(event) => event.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">Create New Group</h2>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Group Name:</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
          {groupNameError && <p className="text-red-600 text-sm mt-1">{groupNameError}</p>}
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Members:</h3>
          {members.map((member, index) => (
            <div key={index} className="flex space-x-2 mb-2 items-center">
              <div className="w-1/2">
                <input
                  type="text"
                  name="name"
                  value={member.name}
                  onChange={(e) => handleMemberChange(index, e)}
                  placeholder="Name"
                  className="w-full px-3 py-2 border rounded"
                />
                {memberErrors[index]?.name && <p className="text-red-600 text-sm mt-1">{memberErrors[index].name}</p>}
              </div>
              <div className="w-1/2">
                <input
                  type="text"
                  name="mobile"
                  value={member.mobile}
                  onChange={(e) => handleMemberChange(index, e)}
                  placeholder="Mobile Number"
                  className="w-full px-3 py-2 border rounded"
                />
                {memberErrors[index]?.mobile && <p className="text-red-600 text-sm mt-1">{memberErrors[index].mobile}</p>}
              </div>
              {members.length > 1 && (
                <button
                  onClick={() => removeMember(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addMember}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
          >
            Add Member
          </button>
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateGroup}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddGroupDialog;
