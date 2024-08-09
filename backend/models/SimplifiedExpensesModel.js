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

const simplified_expense_schema=mongoose.Schema(
    {
        groupId:
        {
            type:String,
            required:true,
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
        payees:
        {
            type: [payeeSchema],
            required: true
        }
        
    },
    {
        timestamps:true,
    }
)
export const SimplifiedExpense = mongoose.model('SimplifiedExpense',simplified_expense_schema);