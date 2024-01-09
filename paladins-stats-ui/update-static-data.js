const fs = require('fs');
const paw = require('@miguelteran/paladins-api-wrapper');

const writeFile = (fileName, arr) => {
    console.log('Writing to file', fileName);
    fs.writeFile('public/' + fileName, JSON.stringify(arr, null, 4), (err) => { if (err) console.log('error writing file ', fileName) });
}

async function main() {
    const champions = await paw.getChampions();
    const talents = [];
    const cards = [];
    for (let champion of champions) {
        const championCards = await paw.getChampionCards(champion.id);
        talents.push(...championCards.filter(c => c.championTalent_URL !== null));
        cards.push(...championCards.filter(c => c.championTalent_URL === null));
    }
    const items = (await paw.getItems()).filter(i => i.item_type.indexOf('Burn Card') !== -1);
    
    writeFile('champions.json', champions);
    writeFile('champion-talents.json', talents);
    writeFile('champion-cards.json', cards);
    writeFile('items.json', items);
}

main();