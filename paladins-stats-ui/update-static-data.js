const fs = require('fs');
const paw = require('@miguelteran/paladins-api-wrapper');

const writeFile = (fileName, arr) => {
    console.log('Writing to file', fileName);
    fs.writeFile('public/' + fileName, JSON.stringify(arr, null, 4), (err) => { if (err) console.log('error writing file ', fileName) });
}

async function main() {
    const champions = await paw.getChampions();
    const items = (await paw.getItems()).sort((a,b) => a.champion_id - b.champion_id);
    const talents = items.filter(item => item.champion_id !== 0 && item.item_type === 'Inventory Vendor - Talents');
    talents.forEach(talent => talent.itemIcon_URL = talent.itemIcon_URL.replace('champion-cards', 'champion-legendaries-badge').replace('jpg', 'png'));

    writeFile('champions.json', champions);
    writeFile('champion-cards.json', items.filter(item => item.champion_id !== 0 && item.item_type !== 'Inventory Vendor - Talents'));
    writeFile('champion-talents.json', items.filter(item => item.champion_id !== 0 && item.item_type === 'Inventory Vendor - Talents'));
    writeFile('items.json', items.filter(item => item.champion_id === 0));
}

main();