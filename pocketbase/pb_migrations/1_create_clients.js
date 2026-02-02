/// <reference path="../pb_data/types.d.ts" />

migrate(
  (db) => {
    const collection = new Collection({
      name: "clients",
      type: "base",
      schema: [
        {
          name: "name",
          type: "text",
          required: true,
          options: { min: 2, max: 200 },
        },
        {
          name: "api_key",
          type: "text",
          required: true,
          options: { min: 32, max: 64 },
        },
        {
          name: "allowed_origins",
          type: "json",
          required: false,
          options: {},
        },
        {
          name: "is_active",
          type: "bool",
          required: false,
          options: {},
        },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_clients_api_key ON clients (api_key)'],
    });

    return Dao(db).saveCollection(collection);
  },
  (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId("clients");
    return dao.deleteCollection(collection);
  }
);
