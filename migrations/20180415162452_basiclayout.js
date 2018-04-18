
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTableIfNotExists("guid", function(table) {
      table.string('id').primary();
    }),
    knex.schema.createTableIfNotExists('users', function(table) {
      table.string('id').primary().references('id').inTable('guid');
      table.string('email').notNullable();
      table.unique(['email'])
      table.string('hash').notNullable();
      table.boolean('confirmed').notNullable();
    }),
    knex.schema.createTableIfNotExists('docs', function(table) {
      table.string('id').primary().references('id').inTable('guid');
      table.string('userid').notNullable().references('id').inTable('users');
      table.string('title', 2048).notNullable();
      table.text('text', 4294967295);
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTableIfExists('docs'),
    knex.schema.dropTableIfExists('users'),
    knex.schema.dropTableIfExists('guid')
  ]);
};
