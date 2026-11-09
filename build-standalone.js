const fs = require('fs');
const path = require('path');

const dir = __dirname;
let html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(dir, 'style.css'), 'utf8');
const iconSvg = fs.readFileSync(path.join(dir, 'icon.svg'), 'utf8');
const iconDataUri = 'data:image/svg+xml;base64,' + Buffer.from(iconSvg).toString('base64');

html = html.replace(/href="icon\.svg"/g, `href="${iconDataUri}"`);
html = html.replace(/<link rel="manifest" href="manifest\.json"\s*\/>/, '');
html = html.replace(/<link rel="stylesheet" href="style\.css"\s*\/>/, () => `<style>\n${css}\n</style>`);

for (const file of ['themes.js', 'audio.js', 'shapes.js', 'particles.js', 'game.js']) {
  const js = fs.readFileSync(path.join(dir, file), 'utf8');
  html = html.replace(`<script src="${file}"></script>`, () => `<script>\n${js}\n</script>`);
}

fs.writeFileSync(path.join(dir, 'BlockBlast-iPhone.html'), html, 'utf8');
console.log('Successfully created BlockBlast-iPhone.html');
