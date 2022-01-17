const router=require('express').Router()
const userCtrl=require('../controllers/userCtrl');
const auth=require('../middlewares/auth')
const authAdmin=require('../middlewares/authAdmin')

router.post('/register',userCtrl.register)
router.post('/activation',userCtrl.activateAccount)
router.post('/login',userCtrl.login)
router.post('/refresh_token',userCtrl.getAccessToken)
router.post('/forgot_password',userCtrl.forgoPassword)
router.post('/reset',auth,userCtrl.resetPassword)
router.get('/user_info',auth,userCtrl.userInfo)
router.get('/all_users',auth,authAdmin,userCtrl.allUsersInfo)

module.exports=router