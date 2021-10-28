module.exports = {
  up: async (queryInterface) => {
    await queryInterface.renameTable('event_public_roles', 'event_scopes');
    await queryInterface.renameColumn('event_scopes', 'role', 'scope');
  },

  down: async (queryInterface) => {
    await queryInterface.renameTable('event_scopes', 'event_public_roles');
    await queryInterface.renameColumn('event_public_roles', 'scope', 'role');
  },
};
