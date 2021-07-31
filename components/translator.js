const americanOnly = require('./american-only.js');
const americanToBritishSpelling = require('./american-to-british-spelling.js');
const americanToBritishTitles = require("./american-to-british-titles.js")
const britishOnly = require('./british-only.js')

const locales = {
  'american-to-british': {
    direction: 0,
    timeRegex: /(\d?\d):(\d\d)/g,
    timeSubstitution: '$1.$2',
    titleRegex: '\\b({title})\\.',
    titleSubstitution: '$1',
    oneWay: americanOnly
  },
  'british-to-american': {
    direction: 1,
    timeRegex: /(\d?\d)\.(\d\d)/g,
    timeSubstitution: '$1:$2',
    titleRegex: '\\b{title}(?!\\.)\\b',
    titleSubstitution: '$&.',
    oneWay: britishOnly
  }
};



class Translator {
  
  translate(body, useHighlight=true) {
    
    if (!body.hasOwnProperty('text') || !body.hasOwnProperty('locale')) {
      return { error: 'Required field(s) missing' };
    }

    if (!body.text) {
      return { error: 'No text to translate' };
    }

    if (!locales[body.locale]) {
      return { error: 'Invalid value for locale field' };
    }

    let rules = locales[body.locale];
    let translated = body.text;
    
    // timestamps
    translated = translated.replace(rules.timeRegex, this.addHighlight(rules.timeSubstitution, useHighlight));
    
    // titles
    for (let key in americanToBritishTitles) {
      let titleFrom = rules.direction === 0 ? key : americanToBritishTitles[key];      
      titleFrom = titleFrom.replace('.', '');

      let regex = new RegExp(rules.titleRegex.replace('{title}', titleFrom), 'gi');
      
      translated = translated.replace(regex, this.addHighlight(rules.titleSubstitution, useHighlight));      
    }

    // spelling
    for (let key in americanToBritishSpelling) {
      let wordFrom = rules.direction === 0 ? key : americanToBritishSpelling[key];
      let wordTo = rules.direction === 0 ? americanToBritishSpelling[key] : key;
      
      translated = translated.replace(new RegExp(`\\b(?<!\\-)${wordFrom}\\b`, 'gi'), this.addHighlight(wordTo, useHighlight));
    }

    // one-ways
    for (let key in rules.oneWay) {
      let wordFrom = key;
      let wordTo = rules.oneWay[key];
      
      translated = translated.replace(new RegExp(`\\b(?<!\\-)${wordFrom}\\b`, 'gi'), this.addHighlight(wordTo, useHighlight));            
    }

    if (body.text === translated) {
      translated = 'Everything looks good to me!';
    }

    return { text: body.text, translation: translated };
  }

  addHighlight(str, useHighlight=true) {    
    return useHighlight ? `<span class="highlight">${str}</span>` : str;
  }

}

module.exports = Translator;