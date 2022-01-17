const mm = require("music-metadata");
const util = require("util");
const glob = util.promisify(require("glob"));
const fs = require("fs");
const rename = util.promisify(fs.rename);

(async () => {
  const files = await glob("F*/*.*");

  const fileMetas = await Promise.all(
    files.map(async (file) => {
      return mm.parseFile(file);
    })
  );

  const extRegex = /\..*/;
  const errors = [];
  const successes = [];
  for (const file of files) {
    try {
      const meta = await mm.parseFile(file);

      if (!meta?.common?.artist) {
        errors.push(file);
        continue;
      }

      const ext = extRegex.exec(file)[0];
      const newFile =
        "songs" +
        `${meta.common.artist}-${meta.common.album}-${
          meta.common.title + ext
        }`.replace(/\//g, "");
      await rename(file, newFile);
      successes.push(`${file}->${newFile}`);
    } catch (e) {
      console.log(e);
    }
  }

  console.log(successes);
  console.log(errors);
})();
