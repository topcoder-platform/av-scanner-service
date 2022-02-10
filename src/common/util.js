const pure = require("@ronomon/pure");
const fs = require("fs/promises");

/**
 * check if the file located at filePath is a zipbomb
 *
 * @param {string} filePath the file path
 * @returns
 */
async function isZipBomb(filePath) {
  const buffer = await fs.readFile(filePath);
  const error = pure.zip(buffer, 0);

  // we only care about zip bombs
  if (error.code === "PURE_E_OK" || error.code.indexOf("ZIP_BOMB") === -1) {
    return [false];
  } else {
    return [true, error.code, error.message];
  }
}

module.exports = {
  isZipBomb,
};
