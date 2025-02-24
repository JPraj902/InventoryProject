import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import QRCode from 'qrcode';
import { format } from 'date-fns';

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
    
    // Update pcs_entries table structure
    await connection.query(`
      CREATE TABLE IF NOT EXISTS pcs_entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        serial_no VARCHAR(255) NOT NULL,
        color VARCHAR(255) NOT NULL,
        size VARCHAR(255),
        weight VARCHAR(255),
        barcode_value VARCHAR(255),
        operator_name VARCHAR(255),
        qr_code TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Bag entries table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bag_entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        serial_no VARCHAR(255) NOT NULL,
        quality VARCHAR(255),
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

    connection.release();
    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Database setup error:', error);
  }
};

setupDatabase();

const generateSerialNumber = async (pool) => {
  try {
    const [rows] = await pool.query('SELECT serial_no FROM pcs_entries ORDER BY id DESC LIMIT 1');
    
    if (rows.length === 0) {
      return 'PCS001';
    }

    const lastSerial = rows[0].serial_no;
    // Extract only the numeric part and ensure it's a valid number
    const numPart = lastSerial.replace(/[^0-9]/g, '');
    const nextNum = parseInt(numPart, 10) + 1;

    if (isNaN(nextNum)) {
      console.error('Invalid serial number format detected:', lastSerial);
      // Fallback to PCS001 if we can't parse the number
      return 'PCS001';
    }
    
    // Format with leading zeros
    return `PCS${nextNum.toString().padStart(3, '0')}`;
  } catch (error) {
    console.error('Error generating serial number:', error);
    // Fallback in case of any errors
    return 'PCS001';
  }
};

const generateBarcodeValue = async (pool) => {
  try {
    const today = new Date();
    const datePrefix = format(today, 'ddMMyy');
    
    const [rows] = await pool.query(
      'SELECT barcode_value FROM pcs_entries WHERE DATE(created_at) = CURDATE() ORDER BY id DESC LIMIT 1'
    );
  
    if (rows.length === 0) {
      return `${datePrefix}01`;
    }

    const lastBarcode = rows[0].barcode_value;
    // Extract only the numeric part from the end of the barcode
    const numPart = lastBarcode.slice(-2);
    const nextNum = parseInt(numPart, 10) + 1;
    
    // Verify that we have a valid number
    if (isNaN(nextNum)) {
      console.error('Invalid barcode format detected:', lastBarcode);
      return `${datePrefix}01`;
    }

    return `${datePrefix}${nextNum.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error generating barcode:', error);
    // Fallback to 01 in case of any errors
    const datePrefix = format(new Date(), 'ddMMyy');
    return `${datePrefix}01`;
  }
};

// Add this new endpoint before your existing endpoints
app.get('/api/pcs/generate-serial', async (_req, res) => {
  try {
    const serialNo = await generateSerialNumber(pool);
    const barcodeValue = await generateBarcodeValue(pool);
    
    // Verify the generated values are valid before sending
    if (!serialNo.startsWith('PCS') || serialNo === 'PCSNaN') {
      throw new Error('Invalid serial number generated');
    }
    
    if (barcodeValue.length !== 8) {
      throw new Error('Invalid barcode value generated');
    }
    
    res.json({
      serialNo,
      barcodeValue
    });
  } catch (error) {
    console.error('Error in serial number generation endpoint:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to generate serial number and barcode'
    });
  }
});

// Update your existing POST endpoint for PCS entries
app.post('/api/pcs', async (req, res) => {
  try {
    const { 
      serial_no,
      color,
      size,
      weight,
      barcode_value,
      operator_name 
    } = req.body;

    // Validate required fields and format
    if (!serial_no || !color || !barcode_value) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: ['serial_no', 'color', 'barcode_value']
      });
    }

    // Validate serial number format
    if (!serial_no.startsWith('PCS') || serial_no === 'PCSNaN') {
      return res.status(400).json({
        error: 'Invalid serial number format',
        details: 'Serial number must start with PCS followed by a number'
      });
    }

    // Validate barcode format (ddmmyyxx where xx is a number)
    if (!/^\d{8}$/.test(barcode_value)) {
      return res.status(400).json({
        error: 'Invalid barcode format',
        details: 'Barcode must be in ddmmyyxx format'
      });
    }

    // Generate QR code data
    const qrData = JSON.stringify({
      serial_no,
      color,
      size: size || '',
      weight: weight || '',
      barcode_value,
      operator_name: operator_name || ''
    });
    
    const qrCode = await QRCode.toDataURL(qrData);

    const query = `
      INSERT INTO pcs_entries 
      (serial_no, color, size, weight, barcode_value, operator_name, qr_code)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(query, [
      serial_no,
      color,
      size || null,
      weight || null,
      barcode_value,
      operator_name || null,
      qrCode
    ]);

    res.status(201).json({
      id: result.insertId,
      qrCode,
      message: 'PCS entry created successfully'
    });
  } catch (error) {
    console.error('Error creating PCS entry:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to create PCS entry'
    });
  }
});

// Create new PCS entry
app.post('/api/pcs', async (req, res) => {
  try {
    const { 
      serial_no,
      color,
      size,
      weight,
      barcode_value,
      operator_name 
    } = req.body;

    // Validate required fields
    if (!serial_no || !color) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: ['serial_no', 'color']
      });
    }

    // Generate QR code data
    const qrData = JSON.stringify({
      serial_no,
      color,
      size: size || '',
      weight: weight || '',
      barcode_value: barcode_value || '',
      operator_name: operator_name || ''
    });
    
    const qrCode = await QRCode.toDataURL(qrData);

    const query = `
      INSERT INTO pcs_entries 
      (serial_no, color, size, weight, barcode_value, operator_name, qr_code)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(query, [
      serial_no,
      color,
      size || null,
      weight || null,
      barcode_value || null,
      operator_name || null,
      qrCode
    ]);

    res.status(201).json({
      id: result.insertId,
      qrCode,
      message: 'PCS entry created successfully'
    });
  } catch (error) {
    console.error('Error creating PCS entry:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to create PCS entry'
    });
  }
});

// Get all PCS entries
app.get('/api/pcs', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pcs_entries ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching PCS entries:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to fetch PCS entries'
    });
  }
});

// Get single PCS entry
app.get('/api/pcs/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pcs_entries WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'PCS entry not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching PCS entry:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to fetch PCS entry'
    });
  }
});

// Update PCS entry
app.put('/api/pcs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      serial_no,
      color,
      size,
      weight,
      barcode_value,
      operator_name 
    } = req.body;

    // Validate required fields
    if (!serial_no || !color) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: ['serial_no', 'color']
      });
    }

    // Generate updated QR code
    const qrData = JSON.stringify({
      serial_no,
      color,
      size: size || '',
      weight: weight || '',
      barcode_value: barcode_value || '',
      operator_name: operator_name || ''
    });
    
    const qrCode = await QRCode.toDataURL(qrData);

    const query = `
      UPDATE pcs_entries 
      SET serial_no = ?, color = ?, size = ?, 
          weight = ?, barcode_value = ?, operator_name = ?, qr_code = ?
      WHERE id = ?
    `;

    const [result] = await pool.query(query, [
      serial_no,
      color,
      size || null,
      weight || null,
      barcode_value || null,
      operator_name || null,
      qrCode,
      id
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
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to update PCS entry'
    });
  }
});

// Delete PCS entry
app.delete('/api/pcs/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM pcs_entries WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'PCS entry not found' });
    }
    
    res.json({ message: 'PCS entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting PCS entry:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to delete PCS entry'
    });
  }
});

// Create new bag entry
app.post('/api/bag', async (req, res) => {
  try {
    const {
      serial_no,
      quality,
      color,
      shading,
      length,
      width,
      operator_name,
      weight,
      size,
      sqr_mtr
    } = req.body;

    // Validate required fields
    if (!serial_no || !color || !length || !width || !operator_name) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: ['serial_no', 'color', 'length', 'width', 'operator_name']
      });
    }

    // Generate QR code data
    const qrData = JSON.stringify({
      serial_no,
      quality: quality || '',
      color,
      shading: shading || '',
      length,
      width,
      operator_name,
      weight: weight || '',
      size: size || '',
      sqr_mtr: sqr_mtr || length * width
    });
    
    const qrCode = await QRCode.toDataURL(qrData);

    const query = `
      INSERT INTO bag_entries 
      (serial_no, quality, color, shading, length, width, operator_name, weight, size, sqr_mtr, qr_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(query, [
      serial_no,
      quality || null,
      color,
      shading || null,
      length,
      width,
      operator_name,
      weight || null,
      size || null,
      sqr_mtr || length * width,
      qrCode
    ]);

    res.status(201).json({
      id: result.insertId,
      qrCode,
      message: 'Bag entry created successfully'
    });
  } catch (error) {
    console.error('Error creating bag entry:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to create bag entry'
    });
  }
});

// Get all bag entries
app.get('/api/bag', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM bag_entries ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching bag entries:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to fetch bag entries'
    });
  }
});

// Get single bag entry
app.get('/api/bag/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM bag_entries WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Bag entry not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching bag entry:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to fetch bag entry'
    });
  }
});

// Update bag entry
app.put('/api/bag/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      serial_no,
      quality,
      color,
      shading,
      length,
      width,
      operator_name,
      weight,
      size,
      sqr_mtr
    } = req.body;

    // Validate required fields
    if (!serial_no || !color || !length || !width || !operator_name) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: ['serial_no', 'color', 'length', 'width', 'operator_name']
      });
    }

    // Generate updated QR code
    const qrData = JSON.stringify({
      serial_no,
      quality: quality || '',
      color,
      shading: shading || '',
      length,
      width,
      operator_name,
      weight: weight || '',
      size: size || '',
      sqr_mtr: sqr_mtr || length * width
    });
    
    const qrCode = await QRCode.toDataURL(qrData);

    const query = `
      UPDATE bag_entries 
      SET serial_no = ?, quality = ?, color = ?, shading = ?, 
          length = ?, width = ?, operator_name = ?, weight = ?, 
          size = ?, sqr_mtr = ?, qr_code = ?
      WHERE id = ?
    `;

    const [result] = await pool.query(query, [
      serial_no,
      quality || null,
      color,
      shading || null,
      length,
      width,
      operator_name,
      weight || null,
      size || null,
      sqr_mtr || length * width,
      qrCode,
      id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Bag entry not found' });
    }

    res.json({
      message: 'Bag entry updated successfully',
      qrCode
    });
  } catch (error) {
    console.error('Error updating bag entry:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to update bag entry'
    });
  }
});

// Delete bag entry
app.delete('/api/bag/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM bag_entries WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Bag entry not found' });
    }
    
    res.json({ message: 'Bag entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting bag entry:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to delete bag entry'
    });
  }
});

app.get('/api/pcs/count', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM pcs_entries');
    res.json({ count: rows[0].count });
  } catch (error) {
    console.error('Error fetching PCS entries count:', error);
    res.status(500).json({ error: 'Failed to fetch PCS entries count' });
  }
});

app.get('/api/bag/count', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM bag_entries');
    res.json({ count: rows[0].count });
  } catch (error) {
    console.error('Error fetching Bag entries count:', error);
    res.status(500).json({ error: 'Failed to fetch Bag entries count' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});