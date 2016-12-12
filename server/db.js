const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: './db/images.sqlite',
  },
  useNullAsDefault: true,
});

knex.schema.createTableIfNotExists('images', table => {
  table.increments('id').primary();
  table.string('url').unique();
  table.integer('status').defaultTo(0);
  table.datetime('create');
}).then();

exports.knex = knex;
