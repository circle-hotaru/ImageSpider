const fs = require('fs');
const url = require('url');
const path = require('path');
const { chromium } = require('playwright');
const cheerio = require('cheerio');
const axios = require('axios');
const uuid4 = require('uuid4');

const target_url = 'https://tuchong.com/1815893/82917869/'

async function dl_file(file_url) {
    var parsed = url.parse(file_url);
    var fileName = path.resolve(__dirname, '../images', uuid4().toString() + ".jpg");

    if (!fs.existsSync(fileName)) {
        const res = await axios.get(file_url, { responseType: 'arraybuffer' });
        fs.writeFileSync(fileName, new Buffer.from(res.data), 'binary');
        console.log("->", fileName);
    }
};

async function run() {
    const browser = await chromium.launch({ headless: false, slowMo: 100 });

    // 页面访问
    const page = await browser.newPage();
    await page.goto(target_url);

    await page.waitForTimeout(3000);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    await page.waitForTimeout(3000);

    // 获取页面HTML
    var content = await page.content();

    // 解析出图片IMG
    const $ = cheerio.load(content);
    $('img').each(async (i, elem) => {
        var image_src = $(elem).attr('src');
        if (image_src) {
            await dl_file(image_src);
        }
    })

    await browser.close();
    console.log('Done');

}

run();