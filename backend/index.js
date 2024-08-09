import express, { request, response } from "express";
import {PORT,mongoDURL} from "./config.js";
import mongoose from "mongoose";
import {User} from "./models/userModel.js";
import userRoute from "./routes/usersRoute.js";
import {Group} from "./models/groupModel.js";
import groupRoute from "./routes/groupsRoute.js";
import expensesRoute from "./routes/expensesRoute.js";
import simplifiedExpenseRoute from "./routes/simplifiedExpensesRoute.js";
import cors from 'cors';

const app=express();
app.use(express.json());
app.use(cors());

app.get('/', (request,response)=>{
    console.log(request)
    return response.status(234).send('Welcome')
});

app.use('/user', userRoute)
app.use('/group', groupRoute)
app.use('/expense', expensesRoute)
app.use('/simplifiedExpense', simplifiedExpenseRoute)

mongoose.connect(mongoDURL).then(()=>{
    console.log('connected');
    app.listen(PORT, ()=>{
        console.log('Started');
    });

}).catch((error)=>{
    console.log(error);
});