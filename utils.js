function Utils() {

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
    console.log(sourceImgSelector.naturalHeight);
    console.log(canvas);
    console.log(mimeType);
    var context = canvas.getContext("2d");
    context.drawImage(sourceImgSelector, 0, 0);
    var newImageData = context.canvas.toDataURL(mimeType);
    var resultImageSelector = new Image();
    resultImageSelector.src = newImageData;
    return resultImageSelector;
  };

  this.click = function (selector) {
    document.querySelector(selector).click();
  };

  this.sizeToReadable = function (size) {
    return Math.round((size / 1024 / 1024)*100)/100 + " Mb" || 0;
  }



};