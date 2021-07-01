// Require library
import errors from '../errors/data';

const excel = require('excel4node');

// Create a new instance of a Workbook class
const workbook = new excel.Workbook();

// Add Worksheets to the workbook
const worksheet = workbook.addWorksheet('Error List');

// Create a reusable style
const style = workbook.createStyle({
  font: {
    color: '#FF0800',
    size: 12,
  },
});
console.log(errors);

Object.keys(errors).forEach((key, index) => {
  console.log(key);
  worksheet
    .cell(index + 1, 1)
    .string(key)
    .style(style);
  worksheet.cell(index + 1, 2).number(errors[key].status);
  worksheet
    .cell(index + 1, 3)
    .string(errors[key].title || '')
    .style(style);
  worksheet
    .cell(index + 1, 4)
    .string(errors[key].detail)
    .style(style);
});

workbook.write('./server/cli/error.xlsx');
