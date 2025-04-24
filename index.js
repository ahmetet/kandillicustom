const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const notifier = require('node-notifier');

const url = 'http://www.koeri.boun.edu.tr/scripts/lst6.asp';

const BUYUKLUK_MIN = 1.7;
const istanbulKeywords = [
    'MARMARA DENIZI',
    'SILIVRI',
    'AVCILAR',
    'GURPINAR',
    'BUYUKCEKMECE',
    'ISTANBUL'
];

const monthMap = {
    '01': 'Ocak', '02': 'Şubat', '03': 'Mart', '04': 'Nisan',
    '05': 'Mayıs', '06': 'Haziran', '07': 'Temmuz', '08': 'Ağustos',
    '09': 'Eylül', '10': 'Ekim', '11': 'Kasım', '12': 'Aralık'
};

const monthNumMap = {
    'Ocak': '01', 'Şubat': '02', 'Mart': '03', 'Nisan': '04',
    'Mayıs': '05', 'Haziran': '06', 'Temmuz': '07', 'Ağustos': '08',
    'Eylül': '09', 'Ekim': '10', 'Kasım': '11', 'Aralık': '12'
};

const dataPath = path.join(__dirname, 'earthquakes.json');

function initJsonFile() {
    if (!fs.existsSync(dataPath)) {
        fs.writeFileSync(dataPath, '[]', 'utf-8');
    }
}

function formatDate(dateStr) {
    const [year, month, day] = dateStr.split('-');
    return `${parseInt(day)} ${monthMap[month]} ${year}`;
}

function loadSavedData() {
    initJsonFile();
    return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
}

function sortDataByDate(data) {
    return data.sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split(' ');
        const [dayB, monthB, yearB] = b.date.split(' ');

        const dateA = new Date(`${yearA}-${monthNumMap[monthA]}-${dayA}T${a.time}`);
        const dateB = new Date(`${yearB}-${monthNumMap[monthB]}-${dayB}T${b.time}`);

        return dateB - dateA; // büyükten küçüğe
    });
}

function saveNewQuake(quake) {
    const oldData = loadSavedData();
    const key = `${quake.date}-${quake.time}-${quake.magnitude}-${quake.location}`;
    const exists = oldData.some(item =>
        `${item.date}-${item.time}-${item.magnitude}-${item.location}` === key
    );

    if (!exists) {
        const updated = [quake, ...oldData];
        const sorted = sortDataByDate(updated);
        fs.writeFileSync(dataPath, JSON.stringify(sorted, null, 2), 'utf-8');
        console.log('Yeni deprem:', quake);

        // 🔔 Masaüstü bildirimi
        notifier.notify({
            title: 'YENİ DEPREM - [ ' + quake.magnitude + ' ]',
            message: `${quake.date} ${quake.time}\n${quake.location}`,
            icon: path.join(__dirname, 'icon.png'), // özel ikon ekle
            sound: true, // sesli uyarı
            wait: false, // tıklamayı beklemez
            timeout: 20 // saniye cinsinden bildirim gösterme süresi
        });
    }
}
async function fetchEarthquakes() {
    try {
        const { data } = await axios.get(url, {
            timeout: 10000,
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const html = Buffer.from(data, 'binary').toString('latin1');
        const $ = cheerio.load(html);
        const text = $('pre').text();
        const lines = text.trim().split('\n').slice(6);

        let found = 0;

        for (const line of lines) {
            const columns = line.trim().split(/\s+/);
            const date = columns[0]?.replace(/\./g, '-');
            const time = columns[1];
            const magnitudeRaw = columns[6];
            const magnitude = magnitudeRaw === '-' ? null : parseFloat(magnitudeRaw.replace(',', '.'));

            let location = columns.slice(8).join(' ')
                .replace(/�/g, 'İ')
                .replace(/Ý/g, 'İ')
                .toUpperCase()
                .trim();

            const isIstanbulRelated = istanbulKeywords.some(keyword => location.includes(keyword));

            if (magnitude !== null && magnitude >= BUYUKLUK_MIN && isIstanbulRelated) {
                const quake = {
                    date: formatDate(date),
                    time,
                    magnitude,
                    location
                };
                saveNewQuake(quake);
                found++;
            }

            if (found === 1) break;
        }
    } catch (error) {
        console.error('Veri alınamadı:', error.message);
    }
}

initJsonFile();
setInterval(fetchEarthquakes, 3000);
