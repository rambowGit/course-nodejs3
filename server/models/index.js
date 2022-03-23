const User = require('./schemas/users');
const bcrypt = require('bcryptjs');
const path = require('path'); 
const uuid = require('uuid').v4;
const prefix = uuid();
const fs = require('fs');
const util = require('util');
const saveFile = util.promisify(fs.rename);
const getFileData = util.promisify(fs.readFile);




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

        console.log("file uploaded ")

        const oldPath = files.avatar.filepath;
        const newPath = path.join(process.cwd(), 'public', 'assets','img', `${prefix}-${files.avatar.originalFilename}`);
        //const dbFilename = path.join('assets','img', `${prefix}-${files.avatar.originalFilename}`);
        
        /*
        сначала сохраняем файл на диске, затем читаем
        TODO: сделать без сохранения на диске
        */
        await saveFile(oldPath, newPath);
        let fileData = fs.readFileSync(newPath, 'base64');
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


const saveUser = async (userName, userObj) => {
    await User.updateOne({userName}, userObj);
}