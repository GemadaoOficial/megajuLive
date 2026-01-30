const bcrypt = require('bcrypt');

exports.hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

exports.comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};
