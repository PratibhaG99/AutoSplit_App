import React,{useState} from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";


const Register = () => {

    const [name,setName]=useState('');
    const [mobile,setMobile]=useState('');
    const [password,setPassword]=useState('');
    const [confirmpassword,setconfirmPassword]=useState('');
    const navigate=useNavigate();

    const handleRegister = async () => {
        try {
            // Validate that password and confirm password match
            if (password !== confirmpassword) {
                alert('Passwords do not match');
                return;
            }
            if(password.length==0) {
                alert('Password can not be empty');
                return;
              }
              if(name.length==0) {
                alert('Name can not be empty');
                return;
              }
              if(mobile.length==0) {
                alert('Mobile Numer can not be empty');
                return;
              }
            console.log(mobile);
            // Check if the mobile number already exists in the database
            const response = await axios.get(`http://localhost:5555/user/${mobile}`);
            console.log(response)
            if (response.data) {
                if(response.data.password!=='')
                alert('Mobile number already exists');
                else{
                    const password_name = { name:name, password:password };
                    const registerResponse = await axios.put(`http://localhost:5555/user/${mobile}`, password_name);
        
                    if (registerResponse.status === 201) {
                        alert('Registration successful');
                        navigate('/autosplit/login');
                    } else {
                        alert('Registration failed');
                    }
                }
            } else {
                // Create a new user
                const newUser = { name, mobile, password };
                const registerResponse = await axios.post('http://localhost:5555/user', newUser);
    
                if (registerResponse.status === 201) {
                    alert('Registration successful');
                    navigate('/autosplit/login');
                } else {
                    alert('Registration failed');
                }
            }
        } catch (error) {
            console.error('Error during registration:', error.message);
            alert('An error occurred during registration. Please try again.');
        }
    };
     

    return (
        <div>
            <section className="bg-gray-50 dark:bg-gray-900">
  <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
          <img className="w-8 h-8 mr-2" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg" alt="logo"/>
          AutoSplit   
      </a>
      <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                  Create an account
              </h1>
                  <div>
                      <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your Name</label>
                      <input type="text" value={name} onChange={(e)=>setName(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="" required=""/>
                  </div>
                  <div>
                      <label htmlFor="mobile" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Mobile</label>
                      <input type="tel" value={mobile} onChange={(e)=>setMobile(e.target.value)} placeholder="" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" pattern="[0-9]{10}" maxLength="10" required=""/>
                  </div>
                  <div>
                      <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                      <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required=""/>
                  </div>
                  <div>
                      <label htmlFor="confirm-password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Confirm password</label>
                      <input type="password" value={confirmpassword} onChange={(e)=>setconfirmPassword(e.target.value)} placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required=""/>
                  </div>
                  <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input id="terms" aria-describedby="terms" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" required=""/>
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="terms" className="font-light text-gray-500 dark:text-gray-300">I accept the <a className="font-medium text-primary-600 hover:underline dark:text-primary-500" href="#">Terms and Conditions</a></label>
                      </div>
                  </div>
                  <button type="submit" onClick={handleRegister} className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Create an account</button>
                  <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                      Already have an account? <a href='/autosplit/login' className="font-medium text-primary-600 hover:underline dark:text-primary-500">Login here</a>
                  </p>
          </div>
      </div>
  </div>
</section>
        </div>
    )
}

export default Register