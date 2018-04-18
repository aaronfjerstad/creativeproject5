exports.up = function(knex, Promise) {
  return Promise.all([
    knex.raw("alter table docs add fulltext(text)"),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.raw("alter table docs drop index text"),
  ]);
};
