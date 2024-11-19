const mongoose =require("mongoose")

mongoose.connect("mongodb://localhost:27017/loginExpresso")
.then(() => {
    console.log("MongoDB Connected");
})
.catch(()=>{
    console.log("failed to connect to MongoDB");
})

const LogInSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: false // Optional field
    },
    lastname: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false // Optional field
    },
    username: {
        type: String,
        required: true
    } ,
    password : {
        type:String,
        required:true
    }
})

const collection =new mongoose.model("ExpressoLogs",LogInSchema)

module.exports=collection