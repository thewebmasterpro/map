/// <reference path="../pb_data/types.d.ts" />

migrate(
  (db) => {
    const collection = new Collection({
      name: "staff",
      type: "base",
      schema: [
        {
          name: "name",
          type: "text",
          required: true,
          options: { min: 2, max: 200 },
        },
        {
          name: "skills",
          type: "json",
          required: false,
          options: {},
        },
        {
          name: "capacity",
          type: "json",
          required: false,
          options: {},
        },
        {
          name: "start_location",
          type: "json",
          required: true,
          options: {},
        },
        {
          name: "is_available",
          type: "bool",
          required: false,
          options: {},
        },
        {
          name: "current_location",
          type: "json",
          required: false,
          options: {},
        },
      ],
    });

    return Dao(db).saveCollection(collection);
  },
  (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId("staff");
    return dao.deleteCollection(collection);
  }
);
