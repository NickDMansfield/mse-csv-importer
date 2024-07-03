
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const moment = require('moment');

const inputFilePath = 'btd.csv';
const outputFilePath = 'output.txt';

const outputStream = fs.createWriteStream(outputFilePath);

const processCards = (card) => {
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');

    const superType = card.Types.split(' - ')[0];
    const subType = card.Types.split(' - ')[1] || '';

    const rarityDict = {
        'C': 'common',
        'U': 'uncommon',
        'R': 'rare',
        'M': 'mythic rare'
    }
    
    // Fix weird issue with name not converting on import
    card.Name = card[Object.keys(card)[0]];

    let ruleText = '';
    if (card.Text) {
        ruleText = card.Text.split(';').map(text => text.trim()).join('\n\t\t');

        // Set card self name in the text
        ruleText = ruleText.replace('~', card.Name);

        // Replace ETB/CITP with 'Enters the battlefield
        ruleText = ruleText.replace('ETBs', 'enters the battlefield');
        ruleText = ruleText.replace('CITP', 'enters the battlefield');
        ruleText = ruleText.replace('On ETB', 'enters the battlefield');
        ruleText = ruleText.replace('On CITP', 'enters the battlefield');
    }

    const cardOutput = `
card:
\thas_styling: false
\tnotes: 
\ttime_created: ${timestamp}
\ttime_modified: ${timestamp}
\tname: ${card.Name}
\tcasting_cost: ${card['Mana Cost']}
\timage: 
\timage_2: 
\tmainframe_image: 
\tmainframe_image_2: 
\tsuper_type: <word-list-type-en>${superType}</word-list-type-en>
\tsub_type: <word-list-race-en>${subType.split(' ')[0]}</word-list-race-en><soft><atom-sep> </atom-sep></soft><word-list-class-en>${subType.split(' ').slice(1).join(' ')}</word-list-class-en>
\trarity: ${rarityDict[card.Rarity]}
\trule_text:
\t\t${ruleText}
\tflavor_text: <i-flavor></i-flavor>
\tpower: ${card.Power}
\ttoughness: ${card.Toughness}
\tcard_code_text: 
\tcard_code_text_2: 
\tcard_code_text_3: 
`;

    outputStream.write(cardOutput);
};

fs.createReadStream(inputFilePath)
    .pipe(csv())
    .on('data', (data) => {
        processCards(data);
    })
    .on('end', () => {
        outputStream.end();
        console.log('CSV file successfully processed');
    });
