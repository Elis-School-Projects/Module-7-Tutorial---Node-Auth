// NPM Import
const jwt = require('jsonwebtoken');

// DB Import
const User = require('../models/User');

// Handle Errors
const handleErrors = (err) => {
    let error = {email: '', password: ''};

    // Incorrect Email
    if (err.message === 'Incorrect Email.') {
        error.email = "That email is not registered.";
    }

    // Incorrect Password
    if (err.message === 'Incorrect Password.') {
        error.password = "That password is incorrect.";
    }

    // Duplicate Error Code
    if (err.code === 11000) {
        error.email = 'Email is already registered';
    }

    // Validation Errors
    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            error[properties.path] = properties.message;
        });
    }
    console.log(error);
    return error;
}

const maxAge = 3 * 24 * 60 * 60;
const createToken = id => {
    return jwt.sign({ id }, 'thisisagreatsecretthatisverysecret', {
        expiresIn: maxAge
    })
}

module.exports.signup_get = (req, res) => {
    res.render('signup');
}

module.exports.login_get = (req, res) => {
    res.render('login');
}

module.exports.signup_post = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.create({email, password});
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true , maxAge: maxAge * 1000 });
        res.status(201).json({ user: user._id});
    } catch (err) {
        const errors = handleErrors(err);
        console.log(errors);
        res.status(400).json({ errors });
    }

}

module.exports.login_post = async (req, res) => {
    const { email, password } = req.body;

   try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true , maxAge: maxAge * 1000 });
        res.status(200).json({ user: user._id});
   } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
   }
}

module.exports.logout = async (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
}