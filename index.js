const fs = require('fs');
var inspect = require('eyes').inspector({ maxLength: 20000 });
const path = require('path');
var pdf_extract = require('pdf-extract');

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
  const vadas = data.text_pages.map(textPage => {
    data.text_pages;
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
    console.log(sanitizedVadadar);
    const createVada = sanitizedVadadar.map(item => {
      console.log(
        item
          .trim()
          .replace(/\s(\s|\s\s)(\s)*/g, 'X')
          .split('X'),
      );
      const vada = item
        .trim()
        .replace(/\s(\s|\s\s)(\s)*/g, 'X')
        .split('X');
      if (vada.length < 3) return undefined;
      const crackDestiny = vada[1].split('–');
      return {
        no: vada[0],
        route: {
          start: crackDestiny[0],
          end: crackDestiny[1],
        },
        distanceInKm: vada[2],
        fair: vada[3],
        oldFair: vada[4],
      };
    });
    return createVada;
    //   console.log(createVada);
  });
  console.log(vadas)
  fs.writeFileSync('vadadar.json', JSON.stringify(vadas))
  //   inspect(data.text_pages, 'extracted text pages');
  //   callback(null, text_pages);
});
processor.on('error', function(err) {
  inspect(err, 'error while extracting pages');
  return callback(err);
});
