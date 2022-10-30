// @ts-check
/** @type {import('@vivliostyle/cli').VivliostyleConfigSchema} */
const vivliostyleConfig = {
  title: 'MOVING FORTH', // populated into 'publication.json', default to 'title' of the first entry or 'name' in 'package.json'.
  author: 'Brad Rodriguez', // default to 'author' in 'package.json' or undefined
  language: 'ja',
  // readingProgression: 'rtl', // reading progression direction, 'ltr' or 'rtl'.
  size: 'JIS-B5',
  // theme: '', // .css or local dir or npm package. default to undefined
  image: 'ghcr.io/vivliostyle/cli:5.8.1',
  entry: [ // **required field**
    // 'introduction.md', // 'title' is automatically guessed from the file (frontmatter > first heading)
      { rel: 'contents' },
      'Part1.md',
      'Part2.md',
      'Part3.md',
      'Part4.md',
      'Part5.md',
      'Part6.md',
      'Part7.md',
      'Part8.md',
      'glosslo.md',
      'cameltst.md',
      'camel80.md',
      'camel80d.md'
    // {
    //   path: 'epigraph.md',
    //   title: 'おわりに', // title can be overwritten (entry > file),
    //   theme: '@vivliostyle/theme-whatever' // theme can be set individually. default to root 'theme'
    // },
    // 'glossary.html' // html is also acceptable
  ], // 'entry' can be 'string' or 'object' if there's only single markdown file
  // entryContext: './manuscripts', // default to '.' (relative to 'vivliostyle.config.js')
  output: [ // path to generate draft file(s). default to '{title}.pdf'
     './output.pdf', // the output format will be inferred from the name.
  //   {
  //     path: './book',
  //     format: 'webpub',
  //   },
   ],
  workspaceDir: '.vivliostyle', // directory which is saved intermediate files.
  // theme: '@vivliostyle/theme-techbook', // .css or local dir or npm pa
  theme: 'themes/mytheme', // .css or local dir or npm pa
  toc: true, // whether generate and include ToC HTML or not, default to 'false'.
  // cover: './cover.png', // cover image. default to undefined.
  // vfm: { // options of VFM processor
  //   replace: [ // specify replace handlers to modify HTML outputs
  //     {
  //       // This handler replaces {current_time} to a current local time tag.
  //       test: /{current_time}/,
  //       match: (_, h) => {
  //         const currentTime = new Date().toLocaleString();
  //         return h('time', { datetime: currentTime }, currentTime);
  //       },
  //     },
  //   ],
  //   hardLineBreaks: true, // converts line breaks of VFM to <br> tags. default to 'false'.
  //   disableFormatHtml: true, // disables HTML formatting. default to 'false'.
  // },
};

module.exports = vivliostyleConfig;
