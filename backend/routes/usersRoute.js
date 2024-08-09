import express, { request, response } from "express";
import { User } from "../models/userModel.js";
import { Group } from "../models/groupModel.js";

const router=express.Router();

//Route to save a user
router.post('/',async (request,response)=>{
    try{
        if(!request.body.name || !request.body.mobile)
        {    return response.status(400).send({message:'Send all fields'});}
        
        const newUser ={name:request.body.name , mobile:request.body.mobile,password:request.body.password};
        const user=await User.create(newUser);
        return response.status(201).send(user);
    }
    catch(error) {
        console.log(error.message);
        response.status(500).send({message:error.message});
    }
});

//Route to get all users
router.get('/',async (request,response)=>{
    try{
        const user= await User.find({});
        return response.status(201).json(user);
    }
    catch(error) {
        console.log(error.message);
        response.status(500).send({message:error.message});
    }
});

//Route to get user by MobileNumber
router.get('/:mobileNumber', async (request, response) => {
    try {
        const { mobileNumber } = request.params;
        const user = await User.findOne({ mobile: mobileNumber });

        if (user) {
            response.status(200).json(user); // User found, return user data
        } else {
            response.status(200).send(); // User not found
        }
    } catch (error) {
        console.error('Error checking user existence:', error.message);
        response.status(500).json({ message: 'Internal server error' });
    }
});

//Route to update user password by MobileNumber
router.put('/:mobileNumber',async (request,response)=>{
    try{
        const {mobileNumber}=request.params;
        const user = await User.findOne({ mobile: mobileNumber });
        if (user) {
            console.log(request.body)
            user.password =  request.body.password;
            user.name =  request.body.name;
            await user.save();
            return response.status(201).json(user);
        } else {
            return response.status(401).send( {message : 'User not found'});
        }
    }
    catch(error) {
        console.log(error.message);
        response.status(500).send({message:error.message});
    }
});

//Route to Delete user by MobileNumber
router.delete('/:mobileNumber', async (request,response)=>{
    try{
        const {mobileNumber}=request.params;
        const user = await User.findOneAndDelete({ mobile: mobileNumber });
        if (user) {
            response.status(200).send({ message: 'User deleted successfully' });
        } else {
            response.status(404).send({ message: 'User not found' });
        }
    }
    catch(error) {
        console.log(error.message);
        response.status(500).send({message:error.message});
    }
});

//Route to get all GroupID's having this user
router.get('/allgroups/:mobileNumber',async (request,response)=>{
    try{
        const {mobileNumber} = request.params;
        
        const groups = await Group.find({ gmembers: mobileNumber });

        if (groups.length > 0) {
            response.status(200).json(groups);
        } else {
            console.log('No groups found for mobile number:', mobileNumber);
            response.status(404).json({ message: 'No groups found' });
        }

    }
    catch(error) {
        console.log(error.message);
        response.status(500).send({message:error.message});
    }
});

export default router;