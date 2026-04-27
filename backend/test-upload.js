import fs from 'fs';

const test = async () => {
  try {
    const fd = new FormData();
    fd.append('image', new Blob([fs.readFileSync('./package.json')]), 'package.json');
    const res = await fetch('http://[::1]:3000/api/items/upload', {
      method: 'POST',
      body: fd
    });
    console.log(res.status, await res.text());
  } catch (err) {
    console.error(err);
  }
}
test();
