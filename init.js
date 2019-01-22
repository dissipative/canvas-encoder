var page = new Utils();
var fileInput = document.querySelector('#file-input');
var imgSource = document.querySelector('.img-src');
var imgEncoded = document.querySelector('.img-enc');
var imgSourceSizeBinCell = document.querySelector('.img-src-size-bin');
var imgEncodedSizeBinCell = document.querySelector('.img-enc-size-bin');
var imgSourceSizeBase64Cell = document.querySelector('.img-src-size-base64');
var imgEncodedSizeBase64Cell = document.querySelector('.img-enc-size-base64');
var imgSourceFormatCell = document.querySelector('.img-src-format');

fileInput.addEventListener('change', function () {
  var reader = new FileReader;
  imgSource.src = imgEncoded.src = imgSourceFormatCell.textContent = '';
  imgSourceSizeBinCell.textContent = imgSourceSizeBase64Cell.textContent = 0;
  imgEncodedSizeBinCell.textContent = imgEncodedSizeBase64Cell.textContent = 0;

  reader.onload = function (e) {
    imgSource.src = e.target.result;

    imgSourceSizeBinCell.textContent = page.sizeToReadable(this.files[0].size);
    imgSourceSizeBase64Cell.textContent = page.sizeToReadable(imgSource.src.length);
    imgSourceFormatCell.textContent = this.files[0].type;
  }.bind(this);

  reader.onloadend = function () {
    var compressedImage = page.compressImage(imgSource, 50);
    imgEncoded.src = compressedImage.src;
    var encodedSize = imgEncoded.src.length;
    imgEncodedSizeBase64Cell.textContent = page.sizeToReadable(encodedSize);
    imgEncodedSizeBinCell.textContent = page.sizeToReadable(encodedSize/4*3);
  };
  
  reader.readAsDataURL(this.files[0]);
});