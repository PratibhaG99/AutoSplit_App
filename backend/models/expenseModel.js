import mongoose from "mongoose"

const payeeSchema = mongoose.Schema({
    phone: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
}, { _id: false });

const expense_schema=mongoose.Schema(
    {
        groupId:
        {
            type:String,
            required:true,
        },
        expenseName:
        {
            type:String,
            required:true,
        },
        addedBy:
        {
            type:Number,
            required:true
        },
        payer:
        {
            type:Number,
            required:true
        },
        amount:
        {
            type:Number,
            required:true
        },
        initial:
        {
            type: [payeeSchema],
            required: true
        },
        payees:
        {
            type: [payeeSchema],
            required: true
        },
        type:
        {
            type:String,
            required:true,
        }
        
    },
    {
        timestamps:true,
    }
)
export const Expense = mongoose.model('Expense',expense_schema);