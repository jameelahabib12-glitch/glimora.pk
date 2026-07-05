const User = require("../models/User");
const bcrypt = require("bcryptjs");

// REGISTER
const registerUser = async (req,res)=>{

    try{

        const {name,email,password}=req.body;

        const existingUser = await User.findOne({email});

        if(existingUser){
            return res.send("User already exists.");
        }

        const hashedPassword = await bcrypt.hash(password,10);

        await User.create({

            name,
            email,
            password:hashedPassword

        });

        res.redirect(303, "/login");

    }

    catch(err){

        console.log(err);
        res.status(500).send("Server Error");

    }

};

// LOGIN
const loginUser = async(req,res)=>{

    try{

        const {email,password}=req.body;

        const user = await User.findOne({email});

        if(!user){

            return res.send("Invalid Email");

        }

        const isMatch = await bcrypt.compare(password,user.password);

        if(!isMatch){

            return res.send("Wrong Password");

        }

        req.session.user=user;

        if(user.role==="admin"){

            return res.redirect(303, "/dashboard");

        }

        res.redirect(303, "/");

    }

    catch(err){

        console.log(err);
        res.status(500).send("Server Error");

    }

};

// LOGOUT
const logoutUser=(req,res)=>{

    req.session.destroy();

    res.redirect("/login");

};

module.exports={

    registerUser,
    loginUser,
    logoutUser

};