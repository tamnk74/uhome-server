import Joi from 'joi';

export const createIssueSchema = Joi.object().keys({
  title: Joi.string().max(2048).required(),
  location: Joi.string().max(1048).required(),
  category_ids: Joi.array().items(Joi.string()),
  attachment_ids: Joi.array().items(Joi.string()),
});
