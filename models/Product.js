// models/Product.js
const { pool } = require("../db");

class Product {
  #tableName = "products";

  async getAllProducts({ limit = 10, page = 0 }) {
    const offset = page * limit;
    const result = await pool.query(
      `SELECT * FROM ${this.#tableName}
       ORDER BY id
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  async getProductDetailById(id) {
    const result = await pool.query(
      `
      SELECT 
        p.*,
        a.id   AS attribute_id,
        a.name AS attribute_name,
        av.id  AS attribute_value_id,
        av.value AS attribute_value
      FROM ${this.#tableName} p
      LEFT JOIN product_attributes pa ON pa.product_id = p.id
      LEFT JOIN attributes a          ON a.id = pa.attribute_id
      LEFT JOIN attribute_values av   ON av.id = pa.attribute_value_id
      WHERE p.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) return null;

    const rows = result.rows;

    const first = rows[0];
    const product = {
      id: first.id,
      name: first.name,
      price: first.price,
      description: first.description,
      stock: first.stock,
      brand_id: first.brand_id,
      category_id: first.category_id,
      discount_id: first.discount_id,
      quantity: first.quantity,
      status: first.status,
      created_at: first.created_at,
      updated_at: first.updated_at,
      detail: [],
    };

    for (const row of rows) {
      if (row.attribute_id) {
        product.detail.push({
          attribute_id: row.attribute_id,
          name: row.attribute_name,
          value_id: row.attribute_value_id,
          value: row.attribute_value,
        });
      }
    }

    return product;
  }

  async getProductByName(name) {
    const result = await pool.query(
      `SELECT * FROM ${this.#tableName} WHERE LOWER(name) = LOWER($1)`,
      [name]
    );
    return result.rows?.[0];
  }

  async createProductWithDetails(dto) {
    const { name, price, quantity, category_id, brand_id, detail = [] } = dto;

    if (!name || price == null) {
      throw new Error("Name and price are required");
    }
    if (price <= 0) {
      throw new Error("Үнэний дүн 0-оос их байх ёстой");
    }

    const existing = await this.getProductByName(name);
    if (existing) {
      throw new Error("Бүртгэлтэй бүтээгдэхүүн");
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const productResult = await client.query(
        `INSERT INTO ${this.#tableName}
         (name, price, quantity, category_id, brand_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [name, price, quantity ?? 0, category_id ?? null, brand_id ?? null]
      );
      const product = productResult.rows[0];

      for (const item of detail) {
        const attrName = item.name;
        const value = item.value;

        if (!attrName || value == null) continue;

        let attributeId;
        const attrRes = await client.query(
          `SELECT id FROM attributes
           WHERE LOWER(name) = LOWER($1) AND (category_id = $2 OR $2 IS NULL)`,
          [attrName, category_id ?? null]
        );
        if (attrRes.rowCount > 0) {
          attributeId = attrRes.rows[0].id;
        } else {
          const insertAttr = await client.query(
            `INSERT INTO attributes (name, category_id)
             VALUES ($1, $2)
             RETURNING id`,
            [attrName, category_id ?? null]
          );
          attributeId = insertAttr.rows[0].id;
        }

        let valueId;
        const valRes = await client.query(
          `SELECT id FROM attribute_values
           WHERE attribute_id = $1 AND value = $2`,
          [attributeId, value]
        );
        if (valRes.rowCount > 0) {
          valueId = valRes.rows[0].id;
        } else {
          const insertVal = await client.query(
            `INSERT INTO attribute_values (attribute_id, value)
             VALUES ($1, $2)
             RETURNING id`,
            [attributeId, value]
          );
          valueId = insertVal.rows[0].id;
        }

        await client.query(
          `INSERT INTO product_attributes (product_id, attribute_id, attribute_value_id)
           VALUES ($1, $2, $3)`,
          [product.id, attributeId, valueId]
        );
      }

      await client.query("COMMIT");
      return product;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = Product;
