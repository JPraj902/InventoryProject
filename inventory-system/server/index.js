import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import QRCode from 'qrcode';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'JUG5402M@NI9',
  database: 'inventory_system'
});

const setupDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS pcs_entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        serial_no VARCHAR(255) NOT NULL,
        color VARCHAR(255) NOT NULL,
        size VARCHAR(255),
        weight VARCHAR(255),
        barcode_value VARCHAR(255),
        qr_code TEXT,
        operator_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS bag_entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        serial_no VARCHAR(255) NOT NULL,
        quality VARCHAR(255) NOT NULL,
        color VARCHAR(255) NOT NULL,
        shading VARCHAR(255),
        length DECIMAL(10,2) NOT NULL,
        width DECIMAL(10,2) NOT NULL,
        operator_name VARCHAR(255) NOT NULL,
        weight VARCHAR(255),
        size VARCHAR(255),
        sqr_mtr DECIMAL(10,2),
        qr_code TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS bag_pcs_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bag_id INT,
        pcs_id INT,
        FOREIGN KEY (bag_id) REFERENCES bag_entries(id) ON DELETE CASCADE,
        FOREIGN KEY (pcs_id) REFERENCES pcs_entries(id) ON DELETE CASCADE
      )
    `);

    connection.release();
    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Database setup error:', error);
  }
};

setupDatabase();

app.post('/api/pcs', async (req, res) => {
  try {
    const { color, size, weight, serialNo, barcodeValue, operatorName } = req.body;
    
    const qrData = JSON.stringify({
      serialNo,
      color,
      size,
      weight,
      barcodeValue,
      operatorName
    });
    
    const qrCode = await QRCode.toDataURL(qrData);
    
    const query = `
      INSERT INTO pcs_entries 
      (color, size, weight, serial_no, barcode_value, qr_code, operator_name)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.query(query, [
      color,
      size,
      weight,
      serialNo,
      barcodeValue,
      qrCode,
      operatorName
    ]);
    
    res.status(201).json({
      id: result.insertId,
      qrCode,
      message: 'PCS entry created successfully'
    });
  } catch (error) {
    console.error('Error creating PCS entry:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/pcs', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pcs_entries ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching PCS entries:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/pcs/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pcs_entries WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'PCS entry not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching PCS entry:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/pcs/:id', async (req, res) => {
  const { id } = req.params;
  const { color, size, weight, serialNo, barcodeValue, operatorName } = req.body;

  try {
    const qrData = JSON.stringify({
      serialNo,
      color,
      size,
      weight,
      barcodeValue,
      operatorName
    });
    
    const qrCode = await QRCode.toDataURL(qrData);

    const query = `
      UPDATE pcs_entries 
      SET color = ?, size = ?, weight = ?, 
          serial_no = ?, barcode_value = ?, qr_code = ?, operator_name = ?
      WHERE id = ?
    `;
    
    const [result] = await pool.query(query, [
      color, size, weight, serialNo, barcodeValue, qrCode, operatorName, id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'PCS entry not found' });
    }

    res.json({ 
      message: 'PCS entry updated successfully',
      qrCode 
    });
  } catch (error) {
    console.error('Error updating PCS entry:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/pcs/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM pcs_entries WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'PCS entry not found' });
    }
    
    res.json({ message: 'PCS entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting PCS entry:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bag', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      serial_no,
      quality,
      color,
      shading,
      length,
      width,
      operatorName,
      weight,
      size,
      sqrMtr
    } = req.body;

    const bagData = {
      serial_no,
      quality,
      color,
      shading,
      length,
      width,
      operatorName,
      weight,
      size,
      sqrMtr
    };
    
    const qrCode = await QRCode.toDataURL(JSON.stringify(bagData));

    const [bagResult] = await connection.query(
      `INSERT INTO bag_entries 
       (serial_no, quality, color, shading, length, width, operator_name, weight, size, sqr_mtr, qr_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [serial_no, quality, color, shading, length, width, operatorName, weight, size, sqrMtr, qrCode]
    );

    const bagId = bagResult.insertId;

    if (pcsItems && pcsItems.length > 0) {
      for (const pcsId of pcsItems) {
        await connection.query(
          'INSERT INTO bag_pcs_items (bag_id, pcs_id) VALUES (?, ?)',
          [bagId, pcsId]
        );
      }
    }

    await connection.commit();
    res.status(201).json({
      id: bagResult.insertId,
      qrCode,
      message: 'Bag entry created successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating bag entry:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

app.get('/api/bag', async (req, res) => {
  try {
    const [bags] = await pool.query('SELECT * FROM bag_entries ORDER BY created_at DESC');
    
    for (let bag of bags) {
      const [pcsItems] = await pool.query(
        `SELECT p.* FROM pcs_entries p
         JOIN bag_pcs_items bpi ON p.id = bpi.pcs_id
         WHERE bpi.bag_id = ?`,
        [bag.id]
      );
      bag.pcsItems = pcsItems;
    }
    
    res.json(bags);
  } catch (error) {
    console.error('Error fetching bag entries:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/bag/:id', async (req, res) => {
  try {
    const [bags] = await pool.query('SELECT * FROM bag_entries WHERE id = ?', [req.params.id]);
    
    if (bags.length === 0) {
      return res.status(404).json({ message: 'Bag entry not found' });
    }

    const bag = bags[0];
    
    const [pcsItems] = await pool.query(
      `SELECT p.* FROM pcs_entries p
       JOIN bag_pcs_items bpi ON p.id = bpi.pcs_id
       WHERE bpi.bag_id = ?`,
      [bag.id]
    );
    
    bag.pcsItems = pcsItems;
    res.json(bag);
  } catch (error) {
    console.error('Error fetching bag entry:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/bag/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const {
      quality,
      color,
      shading,
      length,
      width,
      operatorName,
      weight,
      size,
      sqrMtr,
      pcsItems
    } = req.body;

    const bagData = {
      quality,
      color,
      shading,
      length,
      width,
      operatorName,
      weight,
      size,
      sqrMtr,
      pcsItems
    };
    
    const qrCode = await QRCode.toDataURL(JSON.stringify(bagData));

    const [result] = await connection.query(
      `UPDATE bag_entries 
       SET quality = ?, color = ?, shading = ?, length = ?, 
           width = ?, operator_name = ?, weight = ?, size = ?, sqr_mtr = ?, qr_code = ?
       WHERE id = ?`,
      [quality, color, shading, length, width, operatorName, weight, size, sqrMtr, qrCode, id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Bag entry not found' });
    }

    await connection.query('DELETE FROM bag_pcs_items WHERE bag_id = ?', [id]);

    if (pcsItems && pcsItems.length > 0) {
      for (const pcsId of pcsItems) {
        await connection.query(
          'INSERT INTO bag_pcs_items (bag_id, pcs_id) VALUES (?, ?)',
          [id, pcsId]
        );
      }
    }

    await connection.commit();
    res.json({ 
      message: 'Bag entry updated successfully',
      qrCode
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating bag entry:', error);
    res.status(500).json({ error: 'Failed to update bag entry' });
  } finally {
    connection.release();
  }
});

app.delete('/api/bag/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    
    await connection.query('DELETE FROM bag_pcs_items WHERE bag_id = ?', [id]);
    
    const [result] = await connection.query('DELETE FROM bag_entries WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Bag entry not found' });
    }
    
    await connection.commit();
    res.json({ message: 'Bag entry deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting bag entry:', error);
    res.status(500).json({ error: 'Failed to delete bag entry' });
  } finally {
    connection.release();
  }
});

app.get('/api/pcs/count', async (req, res) => {
  try {
    const [result] = await pool.query('SELECT COUNT(*) as count FROM pcs_entries');
    res.json({ count: Number(result[0].count) });
  } catch (error) {
    console.error('Error fetching PCS count:', error);
    res.status(500).json({ error: 'Failed to fetch PCS count' });
  }
});

app.get('/api/bag/count', async (req, res) => {
  try {
    const [result] = await pool.query('SELECT COUNT(*) as count FROM bag_entries');
    res.json({ count: Number(result[0].count) });
  } catch (error) {
    console.error('Error fetching Bag count:', error);
    res.status(500).json({ error: 'Failed to fetch Bag count' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});