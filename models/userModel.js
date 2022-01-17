const mongoose=require('mongoose')
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Insira o teu Nome"],
    },
    email:{
        type:String,
        required:[true,"Insira o teu Nome"],
        trim:true,
        unique:true
    },
    password:{
        type:String,
        required:[true,"Insira o teu Nome"],
    },
    role:{
        type:Number,
       default:0,
    },
    avatar:{
        type:String,
    },
},{
    timestamps:true
})

module.exports=mongoose.model('User',userSchema)