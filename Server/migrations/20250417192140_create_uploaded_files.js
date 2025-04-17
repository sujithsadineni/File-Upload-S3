/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("uploaded_files", (table) => {
    table.uuid("id").primary();
    table.string("filename").notNullable();
    table.string("mimetype");
    table.string("encoding");
    table.string("s3_key").notNullable();
    table.string("s3_url").notNullable();
    table.timestamp("uploaded_at").defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("uploaded_files");
};
