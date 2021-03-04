import Joi from 'joi';

export default Joi.object().keys({
  phone_number: Joi.string().regex(/^[0-9]{10,11}$/),
  password: Joi.string().required().min(8).max(50),
});
