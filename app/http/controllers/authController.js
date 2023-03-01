const User = require('../../models/user')
const bcrypt = require('bcrypt')
const Passport = require('passport')
function authController() {
    const _getRedirectUrl = (req) => {
        return req.user.role === 'admin' ? '/admin/orders' : '/customer/orders'
    }
    return {
        login(req, res) {
            res.render('auth/login')
        },
        postLogin(req, res, next) {
            const { email, password } = req.body
            // Validate request
            if(!email || !password) {
                req.flash('error','Email aur Password kon dalega bhai!!')
                return res.redirect('/login')
            }
            Passport.authenticate('local', (err, user, info) => {
                if(err) {
                    req.flash('error', info.message)
                    return next(err)
                }
                if(!user) {
                    req.flash('error', info.message)
                    return res.redirect('/login')
                }
                req.logIn(user, (err) => {
                    if(err) {
                        req.flash('error', info.message)
                        return next(err)
                    }
                    
                    return res.redirect(_getRedirectUrl(req))
                })
            })(req, res, next)
        },
        register(req, res) {
            res.render('auth/register.ejs')
        },
        async postRegister(req, res) {
            const { name, email, password } = req.body
            // Validate request
            if(!name || !email || !password) {
                req.flash('error','Enter all the feilds buddy!')
                req.flash('name', name)
                req.flash('email', email)
                return res.redirect('/register')
            }
            
            //check if email exists
            User.exists({ email: email }, (err, result) => {
                if(result) {
                    req.flash('error','Email allready in use')
                    req.flash('name', name)
                    req.flash('email', email)
                    return res.redirect('/register')
                }
            })
            //Hash Password
            const hashedPassword = await bcrypt.hash(password, 10)
            //creating a user
            const user = new User({
                name,
                email,
                password: hashedPassword
            })
            user.save().then((user) => {
                //login
                return res.redirect('/')
            }).catch(err => {
                req.flash('error','Something went wrong')
                return res.redirect('/register')
            })
        },
        logout(req, res) {
            req.logout()
            return res.redirect('/login')  
        }
    }
}

module.exports = authController 