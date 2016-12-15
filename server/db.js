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

knex.schema.createTableIfNotExists('view', table => {
  table.increments('id').primary();
  table.integer('imageId');
  table.string('ip');
  table.string('session');
  table.datetime('create');
}).then();

knex.schema.createTableIfNotExists('favorite', table => {
  table.increments('id').primary();
  table.integer('imageId');
  table.string('ip');
  table.string('session');
  table.datetime('create');
  table.integer('status').defaultTo(0);
}).then();

exports.knex = knex;
