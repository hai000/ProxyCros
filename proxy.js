const express = require('express');
const axios = require('axios');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.get('/tots', async (req, res) => {
    const url = req.query.url;
    if (!url) {
        return res.status(400).send('Missing URL parameter');
    }
    url.replace(".ts","")
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const fileName = url.split('/').pop();
        const filePath = path.join(__dirname, `${fileName}.ts`);
        console.log(filePath)
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
app.get('/index.m3u8',async (req, res) => {
    const url = req.query.url;
    if (!url) {
        return res.status(400).send('Missing URL parameter');
    }
    const filePath = path.join(__dirname, 'index.m3u8');
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    try {
        await fs.writeFile(filePath, Buffer.from(response.data),err => {
            if (err){
                 console.log(
                     "lõi"
                 )
            }else {
                console.log("Dã đè file")
            }
        });

        await modifyFile(filePath,res);
    } catch (err) {
        console.error(`Có lỗi xảy ra: ${err.message}`);
    }
})
function modifyFile(filePath,res) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Không thể đọc file: ${err.message}`);
            return;
        }

        const lines = data.split('\n'); // Tách file thành các dòng
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('#EXTINF:') && i + 1 < lines.length) {
                lines[i + 1] = `https://proxycros.onrender.com/tots?url=${lines[i + 1].replace("\n","")} .ts`
                i++;
            }
        }

        // Ghi lại nội dung đã sửa đổi vào file
        fs.writeFile(filePath, lines.join('\n'), (err) => {
            if (err) {
                console.error(`Không thể ghi vào file: ${err.message}`);
            } else {
                console.log(`Đã thêm 'ok' vào dòng kế tiếp sau #EXTINF.`);
                res.download(filePath, (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Error downloading file');
                    }
                });
            }
        });
    });
}

const PORT = 443;
app.listen(PORT, () => {
    console.log(`Proxy server is running on http://localhost:${PORT}`);
});