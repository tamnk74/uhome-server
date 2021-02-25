import Joi from 'joi';

export default Joi.object().keys({
  email: Joi.string().email().max(255),
  password: Joi.string().required().min(8).max(50),
});
