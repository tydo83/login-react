const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../Model/User');
const mongoDBErrorHelper = require('../../lib/mongoDBErrorHelper')

module.exports = {
    signUp: async (req, res) => {
        try{
            let salted = await bcrypt.genSalt(10);
            let hashedPassword = await bcrypt.hash(req.body.password, salted)

            let createdUser = await new User({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: hashedPassword,
            })

            let savedUser = await createdUser.save();
            
            res.json({
                data: savedUser,
            })
        } catch(e) {
            console.log(e.message)
            res.status(500).json(mongoDBErrorHelper(e))
        }
    },
    login: async(req, res) => {
        try{
            let foundUser = await User.findOne({ email: req.body.email });
            if(!foundUser) {
                throw { message: "Email is not registered, please go sign up!"};
            } 
            
            let comparedPassword = await bcrypt.compare(
                req.body.password, 
                foundUser.password
                );
            if(!comparedPassword) {
                throw { message: "Check your email and password!"}
            } else {
                let jwtToken = jwt.sign(
                                    { 
                                        email: foundUser.email, 
                                    }
                                    ,"mightyHamster", 
                                    { expiresIn: "1hr"}
                                    )
                res.json({
                    jwtToken: jwtToken
                })
            }
        } catch(e) {
            console.log(39, e)
            res.status(500).json(mongoDBErrorHelper(e))
        }
    }
}