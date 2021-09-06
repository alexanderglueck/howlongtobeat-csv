const hltb = require('howlongtobeat');
const hltbService = new hltb.HowLongToBeatService();
const fs = require('fs');
const parse = require('csv-parse');

const csvWriter = require('csv-writer').createObjectCsvWriter({
    path: 'out.csv',
    header: [
        {id: 'search', title: 'Gesucht'},
        {id: 'name', title: 'Name'},
        {id: 'gameplayMain', title: 'Main Story'},
        {id: 'gameplayMainExtra', title: 'Main + Extras'},
        {id: 'gameplayComplete', title: 'Completionist'},
    ]
})

const promises = [];
const gamesToCheck = [];

fs.createReadStream('games.csv')
    .pipe(parse({delimiter: ','}))
    .on('data', row => {
        const gameName = row[0].trim()
        gamesToCheck.push(gameName)
        promises.push(new Promise((resolve) => {
            setTimeout(() => {
                hltbService.search(gameName)
                    .then(response => resolve(response))
            }, 200 * gamesToCheck.length)
        }))
    })
    .on('end', function () {
        Promise.all(promises).then((values) => {
            console.log(values);
            const data = [];

            for (const gameResults of values) {
                for (const value of gameResults) {
                    console.log(value)
                    data.push({
                        search: value.search,
                        name: value.name,
                        gameplayMain: value.gameplayMain,
                        gameplayMainExtra: value.gameplayMainExtra,
                        gameplayComplete: value.gameplayCompletionist,
                    })
                }
            }

            csvWriter
                .writeRecords(data)
                .then(() => console.log('The CSV file was written successfully'));
        });
    });
