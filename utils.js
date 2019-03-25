const ankas = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

function replaceNumberWithAnka(angrejiNumber) {
  return String(angrejiNumber)
    .split('')
    .map((number) => anka[number])
    .join('');
}
function replaceAnkaWithNumber(nums) {
  return nums
    .split('')
    .map((anka) => ankas.indexOf(anka))
    .join('')
    .replace(/-/g, '.');
}
module.exports = {
  replaceAnkaWithNumber,
  replaceNumberWithAnka,
};
