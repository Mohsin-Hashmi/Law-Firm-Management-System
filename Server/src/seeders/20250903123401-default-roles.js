'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
   await queryInterface.bulkInsert('roles', [
  { name: 'Super Admin', createdAt: new Date(), updatedAt: new Date() },
  { name: 'Firm Admin', createdAt: new Date(), updatedAt: new Date() },
  { name: 'Lawyer', createdAt: new Date(), updatedAt: new Date() },
  { name: 'Client', createdAt: new Date(), updatedAt: new Date() },
], { ignoreDuplicates: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {});
  },
};
