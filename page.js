function Page() {
  var imgSource = document.querySelector('.img-src');
  var imgEncoded = document.querySelector('.img-enc');
  var imgSourceSizeBinCell = document.querySelector('.img-src-size-bin');
  var imgEncodedSizeBinCell = document.querySelector('.img-enc-size-bin');
  var imgSourceSizeBase64Cell = document.querySelector('.img-src-size-base64');
  var imgEncodedSizeBase64Cell = document.querySelector('.img-enc-size-base64');
  var imgSourceFormatCell = document.querySelector('.img-src-format');
  
  this.compressImage = function (sourceImgSelector, quality, outputFormat) {
    var mimeType;
    if (outputFormat === "png") {
      mimeType = "image/png";
    } else if (outputFormat === "webp") {
      mimeType = "image/webp";
    } else {
      mimeType = "image/jpeg";
    }

    var canvas = document.createElement('canvas');

    canvas.width = sourceImgSelector.naturalWidth;
    canvas.height = sourceImgSelector.naturalHeight;
    console.log(sourceImgSelector.naturalWidth, canvas.width)
    var context = canvas.getContext("2d");
    context.drawImage(sourceImgSelector, 0, 0);
    var newImageData = context.canvas.toDataURL(mimeType, quality);
    var resultImageSelector = new Image();
    resultImageSelector.src = newImageData;
    console.log('image compressd')
    return resultImageSelector;
  };

  this.click = function (selector) {
    document.querySelector(selector).click();
  };

  this.sizeToReadable = function (size) {
    return Math.round((size / 1024 / 1024)*100)/100 + " Mb" || 0;
  }
  
  this.checkImage = function(img, callback) {
    if (!img.naturalWidth) {
      setTimeout(this.checkImage.bind(this), 200, img, callback.bind(this));
      return;
    }
    if (typeof callback ==='function') {
      return callback();
    }
  }

  this.fileChange = function (file) {
    var reader = new FileReader;
    imgSource.src = imgEncoded.src = imgSourceFormatCell.textContent = '';
    imgSourceSizeBinCell.textContent = imgSourceSizeBase64Cell.textContent = 0;
    imgEncodedSizeBinCell.textContent = imgEncodedSizeBase64Cell.textContent = 0;
  
    reader.onload = function (e) {
      imgSource.src = e.target.result;
  
      imgSourceSizeBinCell.textContent = this.sizeToReadable(file.size);
      imgSourceSizeBase64Cell.textContent = this.sizeToReadable(imgSource.src.length);
      imgSourceFormatCell.textContent = file.type;
    }.bind(this);
  
    reader.onloadend = function () {
      if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
        return;
      }

      this.checkImage(imgSource, function (){
        var compressedImage = this.compressImage(imgSource, 50);
        imgEncoded.src = compressedImage.src;
        var encodedSize = imgEncoded.src.length;
        imgEncodedSizeBase64Cell.textContent = this.sizeToReadable(encodedSize);
        imgEncodedSizeBinCell.textContent = this.sizeToReadable(encodedSize/4*3);  
      }.bind(this));
    }.bind(this);
    
    reader.readAsDataURL(file);
  }


};

var page = new Page();