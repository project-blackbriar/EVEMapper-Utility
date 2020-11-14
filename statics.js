const fs = require('fs');
const db = require('./db');
const systems = db.Database().collection("systems");
const EveService = require('./eveService');
const throttledQueue = require('throttled-queue');
const throttle = throttledQueue(10, 200, true);
const eveService = new EveService();
const CsvReadableStream = require('csv-reader');

module.exports.UpdateStatics = () => {
    const wormholeDbFile = fs.createReadStream('./wormhole.db');
    const statics = fs.createReadStream('./statics.csv', 'utf8');
    const wormholeTypes = [];
    wormholeDbFile.on('data', (data) => {
        data.toString().split('\n').forEach(line => {
            const type = line.search('hi-sec') !== -1 ? 'HS' : line.search('low-sec') !== -1 ? 'LS' : line.search('0.0') !== -1 ? 'NS' : line.search('w-space') !== -1 && line.search('drifter') === -1 ? 'WH' : null;
            if (type) {
                const wt = {
                    name: line.match(new RegExp('Wormhole ([A-Z][0-9]+)', 'g'))[0],
                    code: line.match(new RegExp('([A-Z][0-9]+)', 'g'))[0],
                    time: parseInt(line.match(new RegExp('[0-9]+ h', 'g'))[0].substr(0, 2)),
                    goes: type === 'WH' ? 'C' + line.match(new RegExp('Class [0-9]+', 'g'))[0].match(new RegExp('[0-9]+'))[0] : type
                };
                wormholeTypes.push(wt);
            }
        });
    }).on('end', () => {
        statics.pipe(new CsvReadableStream({parseNumbers: true, parseBooleans: true, trim: true, skipHeader: true}))
            .on('data', function (row) {
                throttle(async () => {
                    try {
                        const type = await eveService.getType(row[2]);
                        const whType = wormholeTypes.find(val => val.name === type.name);
                        const system = await systems.findOneAndUpdate({
                            system_id: parseInt(row[1]),
                            'statics.code': {$ne: whType.code}
                        }, {
                            $push: {
                                'statics': whType
                            }
                        }, {
                            upsert: true,
                        });
                        console.log('Updated', parseInt(row[1]));
                    } catch (ex) {
                        console.error(ex.message, row[1]);
                    }
                });
            })
            .on('end', async function (data) {
            });
    });
};
