function Page() {
  var imgSource = document.querySelector('.img-src');
  var imgEncoded = document.querySelector('.img-enc');
  var imgSourceSizeBinCell = document.querySelector('.img-src-size-bin');
  var imgEncodedSizeBinCell = document.querySelector('.img-enc-size-bin');
  var imgSourceSizeBase64Cell = document.querySelector('.img-src-size-base64');
  var imgEncodedSizeBase64Cell = document.querySelector('.img-enc-size-base64');
  var imgSourceFormatCell = document.querySelector('.img-src-format');
  var imgSourceOrientationCell = document.querySelector('.img-src-orientation');
  var imgSourceModelCell = document.querySelector('.img-src-model');
  var gotExif = false;
  var orientation;
  var iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);

  this.compressImage = function (sourceImgSelector, quality, outputFormat, orientation) {
    var mimeType;
    if (outputFormat === "png") {
      mimeType = "image/png";
    } else if (outputFormat === "webp") {
      mimeType = "image/webp";
    } else {
      mimeType = "image/jpeg";
    }

    var canvas = document.createElement('canvas');
    var width = sourceImgSelector.naturalWidth;
    var height = sourceImgSelector.naturalHeight;

    // fix canvas for portrait mode
    if (~[5, 6, 7, 8].indexOf(orientation) && !iOS) {
      canvas.width = height;
      canvas.height = width;
    } else {
      canvas.width = width;
      canvas.height = height;
    }

    var context = canvas.getContext("2d");
    context = this.fixContextOrientation(orientation, context, width, height);
    context.drawImage(sourceImgSelector, 0, 0);

    var newImageData = context.canvas.toDataURL(mimeType, quality);
    var resultImageSelector = new Image();
    resultImageSelector.src = newImageData;

    return resultImageSelector;
  };

  this.fixContextOrientation = function (exifOrientation, context, width, height) {
    if (iOS) {
      switch (exifOrientation) {
        case 6:
          context.transform(0, 1, -1, 0, width, 0);
          break;
        default:
          context.transform(1, 0, 0, 1, 0, 0);
      }
      return context;
    }
    switch (exifOrientation) {
      case 2:
        context.transform(-1, 0, 0, 1, width, 0);
        break;
      case 3:
        context.transform(-1, 0, 0, -1, width, height);
        break;
      case 4:
        context.transform(1, 0, 0, -1, 0, height);
        break;
      case 5:
        context.transform(0, 1, 1, 0, 0, 0);
        break;
      case 6:
        context.transform(0, 1, -1, 0, height, 0);
        break;
      case 7:
        context.transform(0, -1, -1, 0, height, width);
        break;
      case 8:
        context.transform(0, -1, 1, 0, 0, width);
        break;
      default:
        context.transform(1, 0, 0, 1, 0, 0);
    }
    return context;
  };

  this.click = function (selector) {
    document.querySelector(selector).click();
  };

  this.sizeToReadable = function (size) {
    return Math.round((size / 1024 / 1024) * 100) / 100 + " Mb" || 0;
  }

  this.gotImageLoaded = function (img, callback) {
    if (!img.naturalWidth || !gotExif) {
      setTimeout(this.gotImageLoaded.bind(this), 200, img, callback.bind(this));
      return;
    }
    if (typeof callback === 'function') {
      return callback();
    }
  };

  this.addMeta = function (file) {
    EXIF.getData(file, function () {
      var allMetaData = EXIF.getAllTags(this);
      console.log(allMetaData);
      imgSourceOrientationCell.textContent = allMetaData.Orientation || 'none';
      imgSourceModelCell.textContent = allMetaData.Model || 'none';
      gotExif = true;
      orientation = allMetaData.Orientation;
    });
  };

  this.fileChange = function (file) {
    if (!file) {
      return;
    }
    var reader = new FileReader;
    gotExif = false;
    orientation = null;
    this.addMeta(file);
    imgSource.src = imgEncoded.src = imgSourceFormatCell.textContent = '';
    imgSourceSizeBinCell.textContent = imgSourceSizeBase64Cell.textContent = 0;
    imgEncodedSizeBinCell.textContent = imgEncodedSizeBase64Cell.textContent = 0;
    imgSourceOrientationCell.textContent = imgSourceModelCell.textContent = 'none';

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

      this.gotImageLoaded(imgSource, function () {
        var compressedImage = this.compressImage(imgSource, 50, file.type, orientation);
        imgEncoded.src = compressedImage.src;
        var encodedSize = imgEncoded.src.length;
        imgEncodedSizeBase64Cell.textContent = this.sizeToReadable(encodedSize);
        imgEncodedSizeBinCell.textContent = this.sizeToReadable(encodedSize / 4 * 3);
      }.bind(this));
    }.bind(this);

    reader.readAsDataURL(file);
  };

};

var page = new Page();