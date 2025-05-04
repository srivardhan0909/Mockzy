import pool from '../config/db.js';

const createSlotsTable = async () => {
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS slots (
                id SERIAL PRIMARY KEY,
                admin_id INTEGER NOT NULL,
                date DATE NOT NULL,
                time TIME NOT NULL,
                duration INTEGER NOT NULL,
                mode VARCHAR(20) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        await pool.query(query);
        console.log("✅ slots table created successfully");
        process.exit(); // Exit script
    } catch (err) {
        console.error("❌ Error creating slots table:", err.message);
        process.exit(1); // Exit with error
    }
};

createSlotsTable();
