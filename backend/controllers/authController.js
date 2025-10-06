const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
}

// REGISTER USER
exports.registerUser = async (req, res) => {
    const {fullName, email, password, profilePicture} = req.body || {};

    // Validation: Check for missing fialds
    if(!fullName || !email || !password){
        return res.status(400).json({message: 'Please fill in all required fields'});
    }

    try{
        // Check if user already exists
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message: 'Email already in use'});
        }

        // Create the user
        const user = await User.create({
            fullName,
            email,
            password,
            profilePicture
        }); 

        res.status(201).json({
            id: user._id,
            user,
            token: generateToken(user._id)
        })
    }
    catch(error){
        res
            .status(500)
            .json({message: "Error registering user", error: error.message})
    }
} 

// LOGIN USER
exports.loginUser = async (req, res) => {
    const {email, password} = req.body || {};

    if(!email || !password){
        return res.status(400).json({message: 'Please provide email and password'});
    }
    try{
        const user = await User.findOne({ email })
        if(!user || ! (await user.comparePassWord(password))){
            return res.status(400).json({message: "Invalid email or password"});
        }

        res.status(200).json({
            id: user._id,
            user,
            token: generateToken(user._id)
        });
    } catch(error){
        res
            .status(500)
            .json({message: "Error logging in", error: error.message})
    }
} 

exports.getUseInfo = async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select("-password")
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        res.status(200).json(user);
    } catch(error){
        res
            .status(500)
            .json({message: "Error fetching user info", error: error.message})
    }
} 