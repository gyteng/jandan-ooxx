const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: './db/images.sqlite',
  },
  useNullAsDefault: true,
});

knex.schema.hasTable('images').then(exist => {
  if(!exist) {
    knex.schema.createTableIfNotExists('images', table => {
      table.increments('id').primary();
      table.string('url').unique();
      table.integer('status').defaultTo(0);
      table.datetime('create');
    }).then();
    return true;
  }
  return knex.schema.hasColumn('images', 'create');
}).then(exist => {
  if(!exist) {
    knex.schema.table('images', table => {
      table.datetime('create');
    }).then();
  }
});

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
