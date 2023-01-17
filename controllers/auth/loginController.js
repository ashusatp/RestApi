import Joi from "joi";
import { User } from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import bcrypt from "bcrypt";
import JwtService from "../../services/JwtService";

const loginController = {
  async login(req, res, next) {
    //validation
    const loginSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
        .required(),
    });

    const { error } = loginSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const { email, password } = req.body;
    let access_token;
    try {
      const user = await User.findOne({ email: email });
      if (!user) {
        return next(CustomErrorHandler.wrongCredentials());
      }

      bcrypt;

      //compare the password
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return next(CustomErrorHandler.wrongCredentials());
      }

      // Token generate
      access_token = JwtService.sign({ _id: user._id, role: user.role });
    } catch (error) {
      return next(error);
    }

    return res.json({ access_token: access_token });
  },
};

export default loginController;
