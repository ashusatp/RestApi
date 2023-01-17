import joi from 'joi'
import CustomErrorHandler from '../../services/CustomErrorHandler';
import { User } from '../../models';
import bcrypt from 'bcrypt'
import JwtService from '../../services/JwtService';
const registerController = {
    async register(req,res,next){
        //checklist
        // validate the request
        // authorise the request
        // check if user is in the database already
        // prepare model
        // store in database
        // generate jwt token
        // send response


        //validation
        const registerSchema = joi.object({
            name: joi.string().min(3).max(30).required(),
            email: joi.string().email().required(),
            password: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
            repeat_password: joi.ref('password')
        })

        const {error} = registerSchema.validate(req.body);
        if(error){
            return next(error);
        }

        //check if user is in the the database already
        try{
            const exist = await User.exists({email: req.body.email});
            if(exist){
                return next(CustomErrorHandler.alreadyExist('This email is already taken.'));
            }
        }catch(err){
            return next(err);
        }

        // Hash password
        const {name,email,password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        // prepare the model
        const user = {
            name,
            email,
            password: hashedPassword
        }
        let access_token;
        try{

            const result = new User(user);
            const data = await result.save();

            //Token
            access_token = JwtService.sign({_id: data._id, role: data.role})
            
        }catch(error){
            return next(error);
        }


        res.json({access_token: access_token})
    }
}

export default registerController;