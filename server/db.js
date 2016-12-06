const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: './db/images.sqlite',
  },
  useNullAsDefault: true,
});

knex.schema.createTableIfNotExists('images', table => {
  table.string('url').primary();
  table.integer('status').defaultTo(0);
}).then();

exports.knex = knex;
