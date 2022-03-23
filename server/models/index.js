const User = require('./schemas/users');
const bcrypt = require('bcryptjs');

module.exports.getAllUsers = async () => {
    return User.find();
}

module.exports.getUserByName = async (username) => {
    return User.findOne({username})
}

module.exports.getUserById = async (id) => {
    return User.findById({_id: id});
}

module.exports.updateUser = async (username, newParams) => {
     // update fields
     await User.updateOne({username}, newParams);
    
    // update passwd
    const curentUser = await User.findOne({username});
    // check current passwd
    const isPasswdValid = bcrypt.compareSync(newParams?.oldPassword, curentUser?.hash);
    if (isPasswdValid) {      
       
        const newHash = bcrypt.hashSync(newParams.newPassword, bcrypt.genSaltSync(10), null)
        await User.updateOne({username}, {hash:newHash});
        
        //return updated user
        return User.findOne({username});   
    }   
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