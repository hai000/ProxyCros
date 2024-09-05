const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();

app.get('/tots', async (req, res) => {
    const url = req.query.url;
    if (!url) {
        return res.status(400).send('Missing URL parameter');
    }

    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const filePath = path.join(__dirname, 'index.ts');
        fs.writeFileSync(filePath, response.data);


        res.download(filePath, (err) => {
            // Xóa file tạm sau khi gửi
            fs.unlinkSync(filePath);
            if (err) {
                console.error(err);
                return res.status(500).send('Error downloading file');
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching the file');
    }
});
app.get('/getFile',async (req, res) => {
    const url = req.query.url;
    const filePath = path.join(__dirname, 'index.m3u8');
    res.download(filePath, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error downloading file');
        }
    });
})

const PORT = 443;
app.listen(PORT, () => {
    console.log(`Proxy server is running on http://localhost:${PORT}`);
});