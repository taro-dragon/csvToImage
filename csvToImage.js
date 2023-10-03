const puppeteer = require('puppeteer');
const fs = require('fs');
const csv = require('csv-parser');

async function convertCSVToImage(csvFilePath, outputImagePath) {
    let data = [];
    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
            data.push(row);
        })
        .on('end', async () => {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();

           let htmlContent = `
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body {
                        font-family: sans-serif;
                    }
                </style>
            </head>
            <body>
                <table border="1">`;
            const headers = Object.keys(data[0]);
            htmlContent += '<thead><tr>';
            for (let header of headers) {
                htmlContent += `<th>${header}</th>`;
            }
            htmlContent += '</tr></thead><tbody>';

            for (let row of data) {
                htmlContent += '<tr>';
                for (let header of headers) {
                    htmlContent += `<td>${row[header]}</td>`;
                }
                htmlContent += '</tr>';
            }

            htmlContent += '</tbody></table></body></html>';

            await page.setContent(htmlContent);
            await page.screenshot({ path: outputImagePath });

            await browser.close();
            console.log(`Image saved to ${outputImagePath}`);
        });
}

const inputCsvPath = process.argv[2];
const outputImagePath = process.argv[3];
if (inputCsvPath && outputImagePath) {
    convertCSVToImage(inputCsvPath, outputImagePath);
} else {
    console.log('Usage: node csvToImage.js <inputCsvPath> <outputImagePath>');
}