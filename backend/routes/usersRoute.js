import express, { request, response } from "express";
import { User } from "../models/userModel.js";
import { Group } from "../models/groupModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const router=express.Router();

function authenticateToken(req,res,next){
    const authHeader=req.headers['authorization']
    const token= authHeader && authHeader.split(" ")[1]
    if(token==null) return res.sendStatus(401)
    
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user)=>{
        if(err) return res.sendStatus(403)
        req.user=user;
        next();
    })
}

router.get('/getuser', authenticateToken ,async (request,response)=>{
    return response.status(201).json(request.user)
});

//Route to save a user
router.post('/',async (request,response)=>{
    try{
        if(!request.body.name || !request.body.mobile)
        {    return response.status(400).send({message:'Send all fields'});}
        const salt= await bcrypt.genSalt();
        const hashedPassword= await bcrypt.hash(request.body.password,salt);
        const newUser ={name:request.body.name , mobile:request.body.mobile,password:hashedPassword};
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

//Route to get all GroupID's having this user
router.get('/allgroups', authenticateToken , async (request,response)=>{
    try{
        const mobileNumber = request.user.mobile;
        
        const groups = await Group.find({ gmembers: mobileNumber });

        if (groups.length > 0) {
            response.status(200).json(groups);
        } else {
            console.log('No groups found for mobile number:', mobileNumber);
            response.status(202).json({ message: 'No groups found' });
        }

    }
    catch(error) {
        console.log(error.message);
        response.status(500).send({message:error.message});
    }
});

//Route to get user by MobileNumber
router.post('/login', async (request, response) => {
    try {
        const { mobile,password } = request.body;
        const user = await User.findOne({ mobile: mobile });
        
        if (user) {
            if(await bcrypt.compare(password,user.password))
            {    
                const accessToken= jwt.sign({ mobile: mobile ,name:user.name},process.env.ACCESS_TOKEN_SECRET)
                response.status(200).json({accessToken:accessToken});

            }
            else
                response.status(201).send("Incorrect Password");
        } else {
            response.status(202).send("Uses not found"); // User not found
        }
    } catch (error) {
        console.error('Error checking user existence:', error.message);
        response.status(500).json({ message: 'Internal server error' });
    }
});

//Route to get user by MobileNumber
router.get('/:mobile' ,async (request, response) => {
    try {
        const { mobile } = request.params;
        const user = await User.findOne({ mobile: mobile });
        
        if (user) {
                response.status(200).json(user);
        } else {
            response.status(202).send("Uses not found"); // User not found
        }
    } catch (error) {
        console.error('Error checking user existence:', error.message);
        response.status(500).json({ message: 'Internal server error' });
    }
});

//Route to update user password by MobileNumber
router.put('/:mobileNumber',authenticateToken,async (request,response)=>{
    try{
        const {mobileNumber}=request.params;
        const user = await User.findOne({ mobile: mobileNumber });
        if (user) {
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



export default router;