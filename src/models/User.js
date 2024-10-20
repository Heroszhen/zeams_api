const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String, 
    email: String,
    password: String,
    roles: { type: Array, default: ['user'] },
    created: { type: Date, default: Date.now },
    photo: { type: String, default: null },
    interlocutors: [
        {type: mongoose.Schema.Types.ObjectId, ref:'user'}
    ]
});

userSchema.pre('save', async function(next) {
    const result = await checkUserFields(this);
    if (result !== null)return next(new Error(result));
    next();
});

userSchema.pre('create', async function(next) {
    const result = await checkUserFields(this);
    if (result !== null)return next(new Error(result));
    next();
});


const userModel = mongoose.model("user", userSchema);
exports.model =  userModel;

async function checkUserFields(data) {
    if (['', null].includes(data.email) || ['', null].includes(data.name)) {
        return 'Email or name is empty';
    }

    const found = await userModel.findOne({email: data.email}).exec();
    if (data._id && found && data._id.toString() !== found._id.toString()) {
        return 'Email is used';
    }

    return null;
}