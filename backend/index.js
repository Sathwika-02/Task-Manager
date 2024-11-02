
require("dotenv").config();
const express=require('express');
const cors=require('cors');
const db=require('./db');
const app=express();
const User=require("./modals/UserModal");
const Task=require("./modals/TaskModal");
const jwt=require("jsonwebtoken");
const {authenticateToken}=require("./utilities");
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', 
        methods: ['GET', 'POST'],
    },
});
app.use(express.json());

app.use(cors({
    // origin:"*"
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    credentials: true,
}))


io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});
const emitTaskUpdate = (event, taskData) => {
    console.log("emit task updayed");
    io.emit(event, taskData)
    
};

app.get("/",(req,res)=>{
    res.json({data:"hello"})
})

app.post("/create-account",async(req,res)=>{
   

        const {fullName,email,password}=req.body;
        if(!fullName){
            return res.status(400).json({error:true,message:"FullName is required"})
        }
        if(!email){
            return res.status(400).json({error:true,message:"Email is required"})
        }
        if(!password){
            return res.status(400).json({error:true,message:"Password is required"})
        }
     const IsUser=await User.findOne({email:email});
     if(IsUser){
        return res.json({
            error:true,
            message:"User already exist"
        })
     }
     const user=new User({
        fullName,
        email,
        password
     });
     await user.save();
     const accessToken=jwt.sign({user},process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:"36000h",
     })

     return res.json({
        error:false,
        user,
        accessToken,
        message:"Registration Successfull",
     })
    
})

app.post("/login",async(req,res)=>{
    const {email,password}=req.body;
    if(!email){
        return res.status(400).json({error:true,message:"Email is required"})
    }
    if(!password){
        return res.status(400).json({error:true,message:"Password is required"})
    }

    const userInfo=await User.findOne({email:email})
    if(!userInfo){
        return res.status(400).json({error:true,message:"User not found"})
    }

    if(userInfo.email ==email && userInfo.password == password){
        const user={user:userInfo};
        const accessToken=jwt.sign({user:userInfo},process.env.ACCESS_TOKEN_SECRET,{
            expiresIn:"36000h"
        });
        return res.json({
            error:false,
            message:"Login successfull",
            email,
            accessToken
        })
    }
    else{
        return res.status(400).json({
            error:true,
            message:"Invalid credentials"
        })
    }
})


app.get("/get-user",authenticateToken,async(req,res)=>{
    const {user}=req.user;
    const isUser=await User.findOne({_id:user._id});
    if(!isUser){
        return res.sendStatus(401);

    }
    return res.json({
        user:isUser,
        message:""
    })
})

//add-task


app.post("/add-task",authenticateToken,async(req,res)=>{
    const{title,content,tags,status,priority,dueDate}=req.body;
    const{user}=req.user;
    if(!title){
        res.status(400).json({error:true,message:"Title is required"})
    }
    if(!content){
        res.status(400).json({error:true,message:"content is required"})
    }
    if(!dueDate){
        res.status(400).json({error:true,message:"Due dateis required"})
    }
    try{
        const task=new Task({
            title,
            content,
            tags:tags||[],
            status,
            priority,
            userId:user._id,
            dueDate: new Date(dueDate)
        })
    
    await task.save();
    emitTaskUpdate('taskCreated', {
        message: "Task created successfully",
        task
    });
    return res.json({
        error:false,
        task,
        message:"Task created successfully"
    })
    }
    catch(error){
        return res.status(500).json({
            error:true,
            message:"Internal server error"
        })
    }
  

})

app.put("/edit-task/:taskid",authenticateToken, async (req,res)=>{
    const taskId=req.params.taskid;
    const {title,content,tags,isPinned,status,priority,dueDate}=req.body;
    const {user}=req.user;
    if(!title && !content && !tags && !dueDate){
        return res.status(400).json({error:true,message:"No changes provided"})
    }
    try{
        const task=await Task.findOne({_id:taskId,userId:user._id});
        if(!task){
            return res.status(404).json({error:true,message:"Task not found"})
        }
        if(title) task.title=title;
        if(content) task.content=content;
        if(tags) task.tags=tags;
        if(isPinned) task.isPinned=isPinned;
        if(status) task.status=status;
        if(priority) task.priority=priority;
        if (dueDate) task.dueDate = new Date(dueDate);

        await task.save();
        emitTaskUpdate('taskUpdated', {   
            message: "Task updated successfully",
            task
        });
        return res.json({
            error:false,
            task,
            message:"Task Updated successfully"
        })
    }
    catch(error){
        return res.status(500).json({
            error:true,
            message:"Internal server error"
        })
    }
})

app.get("/get-all-tasks",authenticateToken,async(req,res)=>{
    const {user}=req.user;
    const { status, priority } = req.query; 
    try{
        const filter = { userId: user._id };
        if (status) {
            filter.status = status; 
        }
        if (priority) filter.priority = priority; 
    const tasks = await Task.find(filter).sort({ dueDate: 1 });
     return res.json({
        error:false,
        tasks,
        message:"All tasks retrieved successfully"
     })
}
catch(error){
    return res.status(500).json({
        error:true,
        message:"Internal server error"
    })
}
})

app.delete("/delete-task/:taskid",authenticateToken,async(req,res)=>{
    const taskId=req.params.taskid;
    const {user}=req.user;
    try{
        const task=await Task.findOne({_id:taskId,userId:user._id});
        if(!task){
            return res.status(404).json({error:true,message:"Task not found"})
        }
        await Task.deleteOne({_id:taskId,userId:user._id});
        emitTaskUpdate('taskDeleted', {
            message: "Task deleted successfully",
            taskId
        });
        return res.json({
            error:false,
            message:"Task deleted successfully"
        })
    }
    catch(error){
        return res.statu(500).json({
            error:true,
            message:"Internal server error"
        })
    }
})


app.put("/update-note-pinned/:taskid",authenticateToken,async(req,res)=>{
    const taskId=req.params.taskid;
    const {isPinned}=req.body;
    const {user}=req.user;
    try{
        const task=await Task.findOne({_id:taskId,userId:user._id})
          if(!task){
            return res.status(400).json({error:true,message:"Task not found"})
          }
           task.isPinned=isPinned;
          await task.save();
          emitTaskUpdate('taskPinnedUpdated', {
            message: "Task pinned status updated successfully",
            task
        });
          return res.json({
            error:false,
            task,
            message:"Task updated successfully"
          })
    }
    catch(error){
        return res.statu(500).json({
            error:true,
            message:"Internal server error"
        })
    }
})
app.get("/search-tasks/",authenticateToken,async(req,res)=>{
    const {user}=req.user;
    const{query}=req.query;
    if(!query){
        return res.status(400).
        json({error:true,message:"search query is required"})
    }
    try{
const matchingNotes=await Task.find({
    userId:user._id,
    $or:[
        {title:{$regex:new RegExp(query,"i")}},
        {content:{$regex:new RegExp(query,"i")}}
    ]
})
return res.json({
    error:false,
    tasks:matchingNotes,
    message:"Tasks matching the search query retrieved successfully"
})
    }
    catch(error){
        return res.statu(500).json({
            error:true,
            message:"Internal server error"
        })
    }
})
server.listen(process.env.PORT, () => {
    console.log('Server is running on port 8000');
});
module.exports=app;