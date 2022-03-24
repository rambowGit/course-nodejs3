const User = require('./schemas/users');

const bcrypt = require('bcryptjs');
const fs = require('fs');
const util = require('util');


module.exports.getAllUsers = async () => {
    return User.find();
}

module.exports.getUserByName = async (username) => {
    return User.findOne({username})
}

module.exports.getUserById = async (id) => {
    return User.findById({_id: id});
}

module.exports.updateUser = async (username, newParams, files) => {
    //console.log("newParams: ", newParams);
    newParams.image = "123dsdsadadsadsadsa";
    await User.updateOne({username}, newParams);
    let u =  User.findOne({username});  

    // avatar
    if (files?.avatar?.filepath) {

        const file = files.avatar.filepath;
        let fileData = fs.readFileSync(file, 'base64');
        newParams.image = "data:image/gif;base64,"+ fileData;  
    } 
     
    
    // update passwd
    if (newParams.oldPassword) {

        console.log("newParams.oldPassword.lenght: ", newParams.oldPassword.lenght)
       
        const curentUser = await User.findOne({username});
         // check current passwd
        const isPasswdValid = bcrypt.compareSync(newParams?.oldPassword, curentUser?.hash);

        if (isPasswdValid) {     
            
            const newHash = bcrypt.hashSync(newParams.newPassword, bcrypt.genSaltSync(10), null);
            newParams.hash = newHash;
            //await User.updateOne({username}, {hash:newHash});    
        }   

    }

    await User.updateOne({username}, newParams);
    return User.findOne({username});   
    
}

module.exports.createUser = async (data) => {
    const {username, surName, firstName, middleName, password} = data;
    const newUser = new User({
        username,
        surName,
        firstName,
        middleName,
        image: '',
        permission: {
            chat: {C: true, R: true, D: true, U: true},
            news: {C: true, R: true, D: true, U: true},
            settings: {C: true, R: true, D: true, U: true},
        }
    })
    newUser.setPassword(password);
    const user = await newUser.save();
    return user;
}


module.exports.deleteUser = async (id) => {
    return User.findByIdAndDelete({_id: id});
}
