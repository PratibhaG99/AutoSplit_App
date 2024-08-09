import mongoose from "mongoose"

const group_schema=mongoose.Schema(
    {
        gname:
        {
            type:String,
            required:true,
        },
        gmembers:
        {
            type:[Number],
            required:true,
            default:[]
        },
        simplified:
        {
            type:Boolean,
            default:false
        }
        
    },
    {
        timestamps:true,
    }
)
export const Group = mongoose.model('Group',group_schema);