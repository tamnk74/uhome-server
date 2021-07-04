module.exports = {
  up: (queryInterface) => {
    return queryInterface.addIndex('identify_cards', ['user_id'], {
      indexName: 'identify_card_user_id_fk1',
      unique: true,
    });
  },

  down: (queryInterface) => {
    return queryInterface.removeIndex('identify_cards', ['user_id'], {
      indexName: 'identify_card_user_id_fk1',
    });
  },
};
