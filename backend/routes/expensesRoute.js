import express from "express";
import { Expense } from "../models/expenseModel.js";
import { Group } from "../models/groupModel.js";

const router=express.Router();

//Route to save a Expense
router.post('/',async (request,response)=>{
    try{
        const { groupId, expenseName, addedBy, payer, amount, initial, payees,  type } = request.body;

        if (!groupId || !expenseName || !addedBy || !payer || !amount || !initial || !payees  || !type) {
            return response.status(400).send({ message: 'Send all fields' });
        }
        
        const newExpense = {groupId,expenseName,addedBy,payer,amount,initial,payees,type};
        console.log(newExpense)
        const expense = await Expense.create(newExpense);
        return response.status(201).send(expense);
    }
    catch(error) {
        response.status(500).send({message:error.message});
    }
});

//Route to update a Expense
router.put('/:eId',async (request,response)=>{
    try{

        const {eId} = request.params;
        const { groupId, expenseName, payer,amount, payees, type } = request.body;

        if (!groupId || !expenseName || !payer || !amount || !payees  || !type) {
            return response.status(400).send({ message: 'Send all fields' });
        }

        const group = await Group.findById(groupId);

        if (!group) {
            return response.status(404).send({ message: 'Group not found' });
        }

        if (!group.gmembers.includes(payer) || payees.some(payee => !group.gmembers.includes(payee.phone))) {
            return response.status(400).send({ message: 'Payer and payee must be members of the group' });
        }

        // find and update the expense by eId 
        const updatedExpense = await Expense.findByIdAndUpdate(
            eId,
            { groupId, expenseName, payer,amount,payees, payees, type },
            { new: true } // Return the updated document
        );

        if (updatedExpense) {
            return response.status(200).send(updatedExpense);
        } else {
            return response.status(404).send({ message: 'Expense not found' });
        }
    }
    catch(error) {
        response.status(500).send({message:error.message});
    }
});


//Route to Delete an expense by eid
router.delete('/:eId', async (request,response)=>{
    try{
        const {eId}=request.params;
        const expense = await Expense.findByIdAndDelete(eId);
        if (expense) {
            response.status(200).send({ message: 'expense deleted successfully' });
        } else {
            response.status(404).send({ message: 'expense not found' });
        }
    }
    catch(error) {
        console.log(error.message);
        response.status(500).send({message:error.message});
    }
});


export default router;