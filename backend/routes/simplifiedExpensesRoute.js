import express from "express";
import { SimplifiedExpense } from "../models/SimplifiedExpensesModel.js";
import { Group } from "../models/groupModel.js";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const router=express.Router();

function authenticateToken(req,res,next){
    const authHeader=req.headers['authorization']
    const token= authHeader && authHeader.split(" ")[1]
    console.log("Token=",token)
    if(token==null) return res.sendStatus(401)
    
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user)=>{
        if(err) return res.sendStatus(403)
        req.user=user;
        next();
    })
}


const smartSplit = (expenses, gId) => {
    // Step 1: Initialize balances
    const balances = {};

    // Step 2: Calculate net balances
    expenses.forEach(expense => {
        const payer = expense.payer;
        const payees = expense.payees;
        const totalAmount = payees.reduce((sum, payee) => sum + payee.amount, 0);
        
        // Payer's balance increases
        balances[payer] = (balances[payer] || 0) + totalAmount;

        // Payees' balances decrease
        payees.forEach(payee => {
            const { phone, amount } = payee;
            balances[phone] = (balances[phone] || 0) - amount;
        });
    });

    // Step 3: Simplify balances
    // Separate creditors and debtors
    const creditors = Object.entries(balances).filter(([user, bal]) => bal > 0).sort((a, b) => b[1] - a[1]);
    const debtors = Object.entries(balances).filter(([user, bal]) => bal < 0).map(([user, bal]) => [user, -bal]).sort((a, b) => b[1] - a[1]);

    // Create a list of transactions to settle debts
    const transactions = [];
    
    let i = 0, j = 0;
    while (i < creditors.length && j < debtors.length) {
        const [creditor, creditAmount] = creditors[i];
        const [debtor, debitAmount] = debtors[j];
        
        const settledAmount = Math.min(creditAmount, debitAmount);
        transactions.push({'groupId':gId, 'payees': [{'phone':debtor,'amount':settledAmount}], 'payer': creditor, 'amount': settledAmount });
        
        creditors[i][1] -= settledAmount;
        debtors[j][1] -= settledAmount;
        if (creditors[i][1] === 0) i++;
        if (debtors[j][1] === 0) j++;
    }

    return transactions;
};



router.post('/:gId',authenticateToken, async (req, res) => {
    try {
        const expenses  = req.body;
        // console.log(expenses)
        const {gId}=req.params;
        // console.log(expenses)
        // Call smart_split function to get simplified expenses
        const simplifiedExpenses = smartSplit(expenses, gId);
        // Create new expenses based on simplified transactions
        // Assuming each transaction in simplifiedExpenses is used to create a new expense
        for (const transaction of simplifiedExpenses) {
            // Save the new expense
            await SimplifiedExpense.create(transaction);
        }
        
        return res.status(201).send(simplifiedExpenses);
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ message: error.message });
    }
});

router.put('/:gId', authenticateToken, async (request,response)=>{
    try{
        const {gId}=request.params;
        const group = await Group.findOne({ _id: gId });
        if (group) {
            group.simplified =  request.body.simplified;
            await group.save();
            return response.status(201).json(group);
        } else {
            return response.status(401).send( {message : 'User not found'});
        }
    }
    catch(error) {
        console.log(error.message);
        response.status(500).send({message:error.message});
    }
});

//Route to Delete all expense of gid
router.delete('/:gId', authenticateToken , async (request, response) => {
    try {
        const { gId } = request.params;
        // Assuming you have an Expense model for your expenses collection
        const result = await SimplifiedExpense.deleteMany({ groupId: gId });

        if (result.deletedCount > 0) {
            response.status(200).send({ message: 'Expenses deleted successfully' });
        } else {
            response.status(200).send({ message: 'No expenses found for the given groupId' });
        }
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});


export default router;