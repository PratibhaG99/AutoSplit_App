import axios from 'axios';
import React, { useState } from 'react';

const EditProfile = ({ user, onClose }) => {
  const [name, setName] = useState(user.name);
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState(user.mobile);
  const [confirmpassword,setConfirmPassword]=useState('');
  const [errors,setErrors]=useState({});

  const handleSave = () => {
    try{
      let newErrors={}
      let valid=true
      if (password !== confirmpassword) {
        newErrors.confirmpassword=('Password should be same.')
        valid=false
      }
      if(password.length==0) {
        newErrors.password=('Password can not be empty')
        valid=false
      }
      if(name.length==0) {
        newErrors.name=('Name can not be empty')
        valid=false
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      const response=axios.put(`http://localhost:5555/user/${mobile}`,{name:name,password:password});
      user.name=name;
      user.password=password;
      localStorage.setItem('loggedInUser', JSON.stringify(user));
      
    }
    catch(error){
      console.log(error.message);
    }
    console.log('Updated Profile:', { name, password, mobile });
    onClose();
  }

  const handleCancel = () => {
    onClose();
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-75" onClick={handleCancel}>
      <div className="bg-white rounded-lg shadow-lg p-4 w-1/3 relative" onClick={(event) => event.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Profile</h2>
          <button onClick={handleCancel} className="text-red-500 hover:text-red-700">
            &times;
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {errors.name && (<p className="text-red-500 text-xs mt-1">{errors.name}</p> )}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {errors.password && (<p className="text-red-500 text-xs mt-1">{errors.password}</p> )}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Confirm Password</label>
          <input
            type="password"
            value={confirmpassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {errors.confirmpassword && (<p className="text-red-500 text-xs mt-1">{errors.confirmpassword}</p> )}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Mobile Number</label>
          <input
            type="text"
            value={mobile}
            readOnly
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100 cursor-not-allowed"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;
