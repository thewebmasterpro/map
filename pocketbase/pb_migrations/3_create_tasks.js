/// <reference path="../pb_data/types.d.ts" />

migrate(
  (db) => {
    const collection = new Collection({
      name: "tasks",
      type: "base",
      schema: [
        {
          name: "type",
          type: "select",
          required: true,
          options: {
            values: ["service", "shipment"],
            maxSelect: 1,
          },
        },
        {
          name: "status",
          type: "select",
          required: true,
          options: {
            values: ["pending", "optimized", "in_progress", "completed"],
            maxSelect: 1,
          },
        },
        {
          name: "client_id",
          type: "relation",
          required: true,
          options: {
            collectionId: "clients",
            cascadeDelete: false,
            maxSelect: 1,
          },
        },
        {
          name: "staff_id",
          type: "relation",
          required: false,
          options: {
            collectionId: "staff",
            cascadeDelete: false,
            maxSelect: 1,
          },
        },
        {
          name: "data",
          type: "json",
          required: true,
          options: {},
        },
        {
          name: "sort_order",
          type: "number",
          required: false,
          options: { min: 0 },
        },
        {
          name: "scheduled_at",
          type: "date",
          required: false,
          options: {},
        },
        {
          name: "completed_at",
          type: "date",
          required: false,
          options: {},
        },
      ],
      indexes: [
        "CREATE INDEX idx_tasks_client ON tasks (client_id)",
        "CREATE INDEX idx_tasks_status ON tasks (status)",
        "CREATE INDEX idx_tasks_type ON tasks (type)",
        "CREATE INDEX idx_tasks_staff ON tasks (staff_id)",
      ],
    });

    return Dao(db).saveCollection(collection);
  },
  (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId("tasks");
    return dao.deleteCollection(collection);
  }
);
