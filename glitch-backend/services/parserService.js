const pdfParse = require('pdf-parse');
const officeParser = require('officeparser');
const fs = require('fs');
const util = require('util');

async function extractTextFromBuffer(buffer, mimetype, originalName) {
  try {
    if (mimetype === 'application/pdf') {
      const options = { max: 1000, version: 'v1.10.100' };
      const data = await pdfParse(buffer, options);
      return data.text;
    } else if (
      mimetype === 'application/vnd.ms-powerpoint' ||
      mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      originalName.endsWith('.ppt') ||
      originalName.endsWith('.pptx')
    ) {
      // officeParser parses either from file path or buffer.
      // We need to write buffer to a temp file first since officeparser handles buffers differently sometimes 
      // or we can use officeParser.parseOfficeAsync with buffer if supported by the version
      
      const tempFilePath = `./temp_${Date.now()}_${originalName}`;
      fs.writeFileSync(tempFilePath, buffer);
      
      try {
        const parsedData = await officeParser.parseOffice(tempFilePath);
        const text = typeof parsedData === 'string' ? parsedData : (parsedData.toText ? parsedData.toText() : JSON.stringify(parsedData));
        // Clean up
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        return text;
      } catch (err) {
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        throw err;
      }
    } else {
      throw new Error(`Unsupported file type: ${mimetype}. Only PDF and PPT/PPTX are supported.`);
    }
  } catch (error) {
    console.error("====== PARSING ERROR ======");
    console.error(error);
    throw new Error("Failed to extract text from document.");
  }
}

module.exports = { extractTextFromBuffer };
