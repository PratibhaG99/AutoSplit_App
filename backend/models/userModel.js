import mongoose from "mongoose"

const user_schema=mongoose.Schema(
    {
        name:
        {
            type:String,
            required:true,
        },
        mobile:
        {
            type:Number,
            required:true,
            unique: true,
        },
        password:{
            type:String
        }
        
    },
    {
        timestamps:true,
    }
)
export const User = mongoose.model('User',user_schema);