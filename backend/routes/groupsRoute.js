import express from "express";
import { Group } from "../models/groupModel.js";
import { Expense } from "../models/expenseModel.js";
import { SimplifiedExpense } from "../models/SimplifiedExpensesModel.js";
const router=express.Router();

//Route to save a group
router.post('/',async (request,response)=>{
    try{
        if(!request.body.gname || !request.body.gmembers)
        {    return response.status(400).send({message:'Send all fields'});}
        
        const newGroup ={gname:request.body.gname , gmembers:request.body.gmembers};
        const group=await Group.create(newGroup);
        return response.status(201).send(group);
    }
    catch(error) {
        console.log(error.message);
        response.status(500).send({message:error.message});
    }
});


//Route to get a group
router.get('/:gId', async (request, response) => {
    try {
        const { gId } = request.params;
        const group = await Group.findById(gId);

        if (group) {
            response.status(200).json(group); // User found, return user data
        } else {
            response.status(200).send(); // User not found
        }
    } catch (error) {
        console.error('Error checking user existence:', error.message);
        response.status(500).json({ message: 'Internal server error' });
    }
});

//Route to update group name and add members to previous list of members
router.put('/:gId', async (request, response) => {
    try {
        const { gId } = request.params;
        const { gname, gmembers } = request.body;

        // Create the update query to set the group name and members
        const updateQuery = { $set: { gname, gmembers } };

        // Find the group by ID and update it
        const group = await Group.findByIdAndUpdate(
            gId,
            updateQuery,
            { new: true } // Return the updated document
        );

        if (group) {
            console.log('Group updated:', group);
            response.status(200).json(group);
        } else {
            console.log('Group not found');
            response.status(404).json({ message: 'Group not found' });
        }
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});


// Route to get expense by group id
router.get('/:gId/expenses', async (request,response)=>{
    try{
        const { gId } = request.params;
        const expenses = await Expense.find({ groupId: gId }).sort({ createdAt: -1 });;

        if (expenses.length > 0) {
            response.status(200).json(expenses);
        } else {
            console.log('No expense found for groupId:', gId);
            response.status(201).json({ message: 'No expense found' });
        }
    }
    catch(error) {
        console.log(error.message);
        response.status(500).send({message:error.message});
    }
});


const calculateUserBalances = (expenses, phone) => {
    const userBalances = {};
    userBalances['to_take']=0
    userBalances['to_give']=0
    expenses.forEach(expense => {
        const { payer, payees } = expense;
        
        // Calculate the net amount for the payer
        if (payer === phone) {
            payees.forEach(payee => {
                if (!userBalances[payee.phone]) userBalances[payee.phone] = 0;
                userBalances[payee.phone] += payee.amount;
                userBalances['to_take']+=payee.amount;
            });
        } else {
            // Calculate the net amount for the payees
            payees.forEach(payee => {
                if (payee.phone === phone) {
                    if (!userBalances[payer]) userBalances[payer] = 0;
                    userBalances[payer] -= payee.amount;
                    userBalances['to_give']-=payee.amount;
                }
            });
        }
    });

    return userBalances;
};


// Route to get all left transactions of user with each other member of the group
router.get('/:gId/:phone/:smartSplitting', async (request, response) => {
    try {
        const { gId, phone,smartSplitting } = request.params;
        let expenses=[]
        console.log("PHONE:",phone)
        if(smartSplitting=="true") {
            expenses = await SimplifiedExpense.find({ groupId: gId });
        }
        else
            expenses = await Expense.find({ groupId: gId });
        if (expenses.length > 0) {
            // Calculate balances
            // console.log("PHONE:",phone)
            const userBalances = calculateUserBalances(expenses, parseInt(phone));
            // console.log("USERbALANCE:",userBalances)
            response.status(200).json(userBalances);
        } else {
            console.log('No expense found for groupId:', gId);
            response.status(201).json({ message: 'No expense found for this group' });
        }
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// Route to settle a user's amount with a person
// router.put('/:gId/:user', async (request, response) => {
//     try {
//         const { gId, user } = request.params;
//         const { person2 } = request.body;
//         const expenses = await Expense.find({ groupId: gId, type: { $ne: 'Settlement' } });

//         if (expenses.length > 0) {
//             const updatedExpenses = [];

//             expenses.forEach(expense => {
//                 const { payer, payees } = expense;

//                 let updated = false;
//                 if (payer === user) {
//                     payees.forEach(payee => {
//                         if (payee.userId === person2) {
//                             payee.amount = 0;
//                             updated = true;
//                         }
//                     });
//                 } else if (payer === person2) {
//                     payees.forEach(payee => {
//                         if (payee.userId === user) {
//                             payee.amount = 0;
//                             updated = true;
//                         }
//                     });
//                 }

//                 if (updated) {
//                     updatedExpenses.push(expense.save());
//                 }
//             });

//             await Promise.all(updatedExpenses);

//             response.status(200).json({ message: 'Settled amounts successfully' });
//         } else {
//             console.log('No expense found for groupId:', gId);
//             response.status(404).json({ message: 'No expense found for this group' });
//         }
//     } catch (error) {
//         console.log(error.message);
//         response.status(500).send({ message: error.message });
//     }
// });


// Route to delete the expenses for a group if it is settled
router.delete('/:gid', async (request, response) => {
    try{
        const {gid}=request.params;
        const group = await Group.findOneAndDelete({ _id: gid });
        if (group) {
            response.status(200).send({ message: 'Expense deleted successfully' });
        } else {
            response.status(404).send({ message: 'Expense not found' });
        }
    }
    catch(error) {
        console.log(error.message);
        response.status(500).send({message:error.message});
    }
});

export default router;