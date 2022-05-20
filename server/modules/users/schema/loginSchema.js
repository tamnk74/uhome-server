import Joi from 'joi';

export const loginSchema = Joi.object().keys({
  phone_number: Joi.string()
    .required()
    .regex(/^[0-9]{10,11}$/)
    .error((errors) => {
      errors.forEach((err) => {
        switch (err.type) {
          case 'any.empty':
            // eslint-disable-next-line no-undef
            err.message = __('validation.register.phone_number.any.empty');
            break;
          case 'string.regex.base':
            // eslint-disable-next-line no-undef
            err.message = __('validation.register.phone_number.string.regex.base');
            break;
          default:
            break;
        }
      });
      return errors;
    }),
  password: Joi.string()
    .required()
    .min(6)
    .error((errors) => {
      errors.forEach((err) => {
        switch (err.type) {
          case 'any.empty':
            // eslint-disable-next-line no-undef
            err.message = __('validation.register.password.any.empty');
            break;
          case 'string.min':
            // eslint-disable-next-line no-undef
            err.message = __('validation.register.password.string.min');
            break;
          default:
            break;
        }
      });
      return errors;
    }),
});
