import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'dlw0qwuw8',
  api_key: '326671696164543',
  api_secret: 'aJ5tm_5b0bQbBaNk5SpLYW5slgI',
});

cloudinary.uploader.upload('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', { folder: 'ims_returns' })
  .then(res => console.log('success', res.secure_url))
  .catch(err => console.error('fail', err));
