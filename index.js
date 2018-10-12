const fs = require('fs');
var inspect = require('eyes').inspector({ maxLength: 20000 });
const path = require('path');
var pdf_extract = require('pdf-extract');
const utils = require('./utils');

var absolute_path_to_pdf = path.join(__dirname, 'Bhadadar.pdf');
var options = {
  type: 'text', // perform ocr to get the text within the scanned image
};

var processor = pdf_extract(absolute_path_to_pdf, options, function(err) {
  if (err) {
    return callback(err);
  }
});
processor.on('complete', function(data) {
  const vadas = data.text_pages.map((textPage, index) => {
    // const textPage = data.text_pages[1];
    const ankas = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    console.log(textPage);
    const sanitizedVadadar = textPage
      .replace(/\n(\s)*ु /g, 'ु')
      .split('\n')
      .filter(line => {
        const haveAnka = ankas.some(anka => line.includes(anka));
        return haveAnka;
      })
      .map(item => item.replace(/\n/, ' '));
    const createVada = sanitizedVadadar
      .map(item => {
        const vada = item
          .trim()
          .replace(/\s(\s|\s\s)(\s)*/g, 'X')
          .split('X');
        if (vada.length < 3) return undefined;
        const crackDestiny = vada[1].split('–');
        return {
          route: {
            start: crackDestiny[0],
            middle: crackDestiny.slice(1, crackDestiny.length - 1),
            end: crackDestiny[crackDestiny.length - 1],
          },
          distanceInKm: {
            np: vada[2],
            en: utils.replaceAnkaWithNumber(vada[2]),
          },

          fair: {
            np: vada[3],
            en: utils.replaceAnkaWithNumber(vada[3]),
          },
          oldFair: vada[4],
        };
      })
      .filter(item => item);
    fs.writeFileSync(`data/vadadar_${index}.json`, JSON.stringify(createVada));
    return createVada;
  });

  let t = {};
  vadas.forEach((n, index) => {
    t[index] = Object.assign(
      {},
      n.reduce((o, i) => {
        const routes = Object.values(i.route);
        const obj = {};
        routes.forEach(element => {
          if (Array.isArray(element)) {
            element.forEach(e => {
              obj[e] = { en: '', np: e };
            });
          } else {
            obj[element] = { en: '', np: element };
          }
        });
        return Object.assign({}, obj, o);
      }, {}),
    );
  });
  fs.writeFileSync(`dats.json`, JSON.stringify(t));
  //   inspect(data.text_pages, 'extracted text pages');
  //   callback(null, text_pages);
});
processor.on('error', function(err) {
  inspect(err, 'error while extracting pages');
  return callback(err);
});
