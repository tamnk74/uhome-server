import { Sequelize, Model } from 'sequelize';
import sequelize from '../databases/database';

const { Op } = Sequelize;

class BaseModel extends Model {
  static get sortKeys() {
    return ['createdAt'];
  }

  static get searchFields() {
    return [];
  }

  static get mapFilterFields() {
    return {};
  }

  static convertKey(mapKeys, object) {
    const result = {};
    Object.keys(mapKeys).forEach((key) => {
      if (object[key] !== undefined) {
        result[mapKeys[key]] = object[key];
      }
    });

    return result;
  }

  static buildOptionQuery(query) {
    const { q, filter, sort } = query;
    const filterData = filter ? this.convertKey(this.mapFilterFields, filter) : {};
    const searchQuery = q ? this.searchFields.map((field) => ({ field, query: q })) : [];
    const optionQuery = {};
    /**
     * Build where clause
     */
    const queryClause = {};
    searchQuery.forEach((itemQuery) => {
      queryClause[itemQuery.field] = { [Op.like]: `%${itemQuery.query}%` };
    });

    optionQuery.where = {
      ...filterData,
      ...(searchQuery.length ? { [Op.or]: queryClause } : queryClause),
    };

    /**
     * Build order clause
     */
    let order = [];
    if (typeof sort === 'string' && this.sortKeys.length) {
      const sortByData = sort.split(',');
      order = sortByData.reduce((resultData, itemSort) => {
        const operator = itemSort[0];
        const key = operator === '-' ? itemSort.substr(1) : itemSort;

        if (this.sortKeys.includes(key)) {
          resultData.push(operator === '-' ? [key, 'desc'] : [key, 'asc']);
        }
        return resultData;
      }, []);
    }

    if (!order.length) {
      order.push(['createdAt', 'desc']);
    }
    optionQuery.order = order;
    return optionQuery;
  }
}

BaseModel.init(
  {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
  },
  {
    sequelize,
  }
);

module.exports = BaseModel;
