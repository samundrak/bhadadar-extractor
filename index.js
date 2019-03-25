const fs = require('fs');
var inspect = require('eyes').inspector({ maxLength: 20000 });
const path = require('path');
var pdf_extract = require('pdf-extract');
const utils = require('./utils');
const shortid = require('shortid');
const uniqby = require('lodash.uniqby');
var absolute_path_to_pdf = path.join(__dirname, 'Bhadadar.pdf');
var options = {
  type: 'text', // perform ocr to get the text within the scanned image
};

const placesIdsMap = new Map();
(async function() {
  const placenames = fs
    .readFileSync('./placenames.csv', 'utf-8')
    .split('\n')
    .map((item) => item.substring(0, item.length - 1).split(','))
    .reduce((obj, current) => {
      if (!current[1]) return obj;
      let id = shortid();
      if (placesIdsMap.has(current[1])) {
        id = placesIdsMap.get(current[1]);
      }
      placesIdsMap.set(current[1], id);
      obj[current[0]] = {
        en: current[1],
        np: current[0],
        id,
      };
      return obj;
    }, {});

  const placeDB = Object.values(placenames);
  // return;
  var processor = pdf_extract(absolute_path_to_pdf, options, function(err) {
    if (err) {
      return callback(err);
    }
  });
  processor.on('complete', function(data) {
    let totalDataStoragesCount = 0;
    const vadas = data.text_pages.map((textPage, index) => {
      // const textPage = data.text_pages[1];
      const ankas = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
      console.log(textPage);
      const sanitizedVadadar = textPage
        .replace(/\n(\s)*ु /g, 'ु')
        .split('\n')
        .filter((line) => {
          const haveAnka = ankas.some((anka) => line.includes(anka));
          return haveAnka;
        })
        .map((item) => item.replace(/\n/, ' '));
      const createVada = sanitizedVadadar
        .map((item) => {
          const vada = item
            .trim()
            .replace(/\s(\s|\s\s)(\s)*/g, 'X')
            .split('X');
          if (vada.length < 3) return undefined;
          const crackDestiny = vada[1].split('–');
          return {
            start: (placenames[crackDestiny[0]] || {}).id,
            middle: crackDestiny.slice(1, crackDestiny.length - 1),
            end: (placenames[crackDestiny[crackDestiny.length - 1]] || {}).id,
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
        .filter((item) => item);
      fs.writeFileSync(
        `data/vadadar_${index}.json`,
        JSON.stringify(createVada)
      );
      totalDataStoragesCount++;
      return createVada;
    });
    fs.writeFileSync(
      `places.json`,
      JSON.stringify({
        data: uniqby(placeDB, 'en'),
        totalItems: totalDataStoragesCount,
      })
    );

    // let t = {};
    // vadas.forEach((n, index) => {
    //   t[index] = Object.assign(
    //     {},
    //     n.reduce((o, i) => {
    //       const routes = Object.values(i.route);
    //       const obj = {};
    //       routes.forEach(element => {
    //         if (Array.isArray(element)) {
    //           element.forEach(e => {
    //             obj[e] = { en: '', np: e };
    //           });
    //         } else {
    //           obj[element] = { en: '', np: element };
    //         }
    //       });
    //       return Object.assign({}, obj, o);
    //     }, {}),
    //   );
    // });
    // fs.writeFileSync(`dats.json`, JSON.stringify(t));
    //   inspect(data.text_pages, 'extracted text pages');
    //   callback(null, text_pages);
  });
  processor.on('error', function(err) {
    inspect(err, 'error while extracting pages');
    return callback(err);
  });
})();
