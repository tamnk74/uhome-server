import Joi from 'joi';

export const updateSkillsSchema = Joi.object().keys({
  category_ids: Joi.array(),
  year_experience: Joi.number().integer(),
});
