const express = require('express');
const router = express.Router();
const db = require('../models');
const helper = require('../helper/serialize');
const passport = require('passport');
const token = require('../auth/tokens');
const formidable = require('formidable');

router.post('/registration', async (req, res) => {
    const {username} = req.body;
    const user = await db.getUserByName(username);

    if (user) {
        return res.status(409).json({message: 'Пользователь уже существует'});
    }

    try {
        const newUser = await db.createUser(req.body);
        // const token = await tokens.createToke
        res.status(201).json({
            ...helper.serializeUser(newUser)
        })
       

    } catch (e) {
        console.log(e);
        res.status(500).json({message: e.message})
    }
})

router.post('/login', async (req, res, next)=>{
    passport.authenticate(
        'local',
        {session: false},
        async (err, user, info) => {
            if (err) {
                return next(err)
            }

            if (!user) {
                return res.status(400).json({message: 'Не верный логин или пароль!'})
            }

            if (user) {
                const generatedToken = await token.createTokens(user);
                console.log(generatedToken)
                res.json({
                    ...helper.serializeUser(user),
                    ...generatedToken
                })

            }
        })(req, res, next)
})

router.get('/refresh-token', async (req, res) => {
    const refreshToken = req.headers['authorization'];
    const data = await token.refreshTokens(refreshToken)
    res.json({...data})
})


const auth = (req, res, next) => {
    passport.authenticate('jwt', {session: false}, (err, user) => {
        if (!user || err){
            return res.status(401).json({
                code: 401,
                message: 'Unauthorized'
            })
        }

        req.user = user
        next()
    })(req, res, next)
}


router.get('/profile', auth, async (req, res) => {
    const user = req.user;

    res.json({
        ...helper.serializeUser(user)
    })
})



router.patch('/profile', auth, async (req, res) => {

    const {username} = req.user; //from auth middleware
    const form = formidable({ multiples: true });


    form.parse(req, async (err, fields, files) => {
        if (err) {
        next(err);
        return;
        }

    const user = await db.getUserByName(username);

    if (user) {
        try {
        const updatedUser = await db.updateUser(username, fields);

        if (!updatedUser) {
            return res.status(400).json({message: 'Не верный пароль!'})
        }

        console.log("updatedUser: ", updatedUser);

        res.status(204).json({
            ...helper.serializeUser(updatedUser)
        })

        } catch (e) {
            console.log(e);
            res.status(500).json({message: e.message})
        }
    }

    });    

})


router.get('/users', async (req, res) => {

    try {
        const allUsers = await db.getAllUsers();

        if (allUsers) {
            
            res.json(allUsers);
        
        } else {
            console.log("there is no users");
        }
    } catch(e){
        console.log(e);
        res.status(500).json({message: e.message});
    }

  
})


  


module.exports = router





