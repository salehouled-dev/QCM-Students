const officeParser = require('officeparser');
const fs = require('fs');
async function run() {
  const filePath = 'test.pptx'; // We will create this
  const PptxGenJS = require('pptxgenjs');
  let pres = new PptxGenJS();
  let slide = pres.addSlide();
  slide.addText('Hello World from PPTX', { x: 1, y: 1 });
  await pres.writeFile({ fileName: filePath });
  
  try {
    const result = await officeParser.parseOffice(filePath);
    console.log("Success! Output type:", typeof result);
    console.log("Is string?", typeof result === 'string');
    console.log("Keys:", Object.keys(result || {}));
  } catch (err) {
    console.log("Caught Error!");
    console.log(err);
  }
}
run();
