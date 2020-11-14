const EveService = require('./eveService');
const db = require('./db');
const systems = db.Database().collection("systems");
const eveService = new EveService();
const throttledQueue = require('throttled-queue');
const throttle = throttledQueue(10, 200, true);
const fs = require('fs');
const CsvReadableStream = require('csv-reader');


module.exports.ImportSystems = async () => {
    const wormholes = [];
    let inputStream = fs.createReadStream('wormholes.csv', 'utf8');
    inputStream
        .pipe(new CsvReadableStream({parseNumbers: true, parseBooleans: true, trim: true}))
        .on('data', function (row) {
            wormholes.push({
                id: row[0],
                name: row[1],
                security: row[2],
                effect: row[3]
            });
        })
        .on('end', async function (data) {
            inputStream.close();
            const eveSystems = await eveService.getSystems();
            await Promise.all(eveSystems.map(async system =>
                await throttle(async () => {
                    const eveSystem = await eveService.getSystem(system);
                    const wormhole = wormholes.find(val => val.id === eveSystem.system_id);
                    let mapSystem;
                    if (wormhole) {
                        mapSystem = {
                            ...eveSystem,
                            security: wormhole.security,
                            effect: wormhole.effect,
                            type: 'J'
                        };
                    } else {
                        mapSystem = {
                            ...eveSystem,
                            security: eveSystem.security_status >= 0.5 ? 'HS' : eveSystem.security_status > 0 ? 'LS' : 'NS',
                            trueSecurityStatus: Math.round((eveSystem.security_status + Number.EPSILON) * 10) / 10,
                            type: 'K'
                        };
                    }
                    await systems.updateOne({
                        system_id: eveSystem.system_id,
                    }, {
                        $set: mapSystem
                    }, {
                        upsert: true
                    });
                    console.log('Updated', eveSystem.name);
                })));
        });
};
