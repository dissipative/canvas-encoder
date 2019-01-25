function Page() {
  var imgSource = document.querySelector('.img-src');
  var imgEncoded = document.querySelector('.img-enc');
  var imgSourceSizeBinCell = document.querySelector('.img-src-size-bin');
  var imgEncodedSizeBinCell = document.querySelector('.img-enc-size-bin');
  var imgSourceSizeBase64Cell = document.querySelector('.img-src-size-base64');
  var imgEncodedSizeBase64Cell = document.querySelector('.img-enc-size-base64');
  var imgSourceFormatCell = document.querySelector('.img-src-format');

  this.click = function (selector) {
    document.querySelector(selector).click();
  };

  this.fileChange = function (file) {
    if (!file) {
      return;
    }

    deleteExif(file, function (result) {
      file = result;
      var reader = new FileReader;
      imgSource.src = imgEncoded.src = imgSourceFormatCell.textContent = '';
      imgSourceSizeBinCell.textContent = imgSourceSizeBase64Cell.textContent = 0;
      imgEncodedSizeBinCell.textContent = imgEncodedSizeBase64Cell.textContent = 0;

      reader.onloadend = function (e) {
        imgSource.src = e.target.result;
        imgSourceSizeBinCell.textContent = sizeToReadable(file.size);
        imgSourceSizeBase64Cell.textContent = sizeToReadable(imgSource.src.length);
        imgSourceFormatCell.textContent = file.type;

        if (file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/webp') {
          return;
        }

        gotImageLoaded(imgSource, function () {
          imgEncoded.src = compressImage(imgSource, 0.5, file.type);

          var encodedSize = imgEncoded.src.length;
          imgEncodedSizeBase64Cell.textContent = sizeToReadable(encodedSize);
          imgEncodedSizeBinCell.textContent = sizeToReadable(encodedSize / 4 * 3);
        }.bind(this));

      }.bind(this);

      reader.readAsDataURL(file);

    }.bind(this));

  };

  function deleteExif(file, callback) {
    var reader = new FileReader();

    reader.onload = function () {
      if (file.type !== 'image/jpeg') {
        return callback(file);
      }

      var dv = new DataView(this.result);
      var offset = 0,
        recess = 0;
      var pieces = [];
      var i = 0;
      if (dv.getUint16(offset) == 0xffd8) {
        offset += 2;
        var app1 = dv.getUint16(offset);
        offset += 2;
        while (offset < dv.byteLength) {
          if (app1 == 0xffe1) {
            pieces[i] = {
              recess: recess,
              offset: offset - 2
            };
            recess = offset + dv.getUint16(offset);
            i++;
          } else if (app1 == 0xffda) {
            break;
          }
          offset += dv.getUint16(offset);
          var app1 = dv.getUint16(offset);
          offset += 2;
        }
        if (pieces.length > 0) {
          console.log('pieces are ok!');
          var newPieces = [];
          pieces.forEach(function (v) {
            newPieces.push(this.result.slice(v.recess, v.offset));
          }, this);
          newPieces.push(this.result.slice(recess));
          var resultImage = new Blob(newPieces, {
            type: 'image/jpeg'
          });
          return callback(resultImage);
        } else {
          return callback(file);
        }
      } else {
        return callback(file);
      }

    };
    reader.readAsArrayBuffer(file);
  }

  function compressImage(sourceImgSelector, quality, mimeType) {
    var canvas = document.createElement('canvas');
    canvas.width = sourceImgSelector.naturalWidth;
    canvas.height = sourceImgSelector.naturalHeight;

    var context = canvas.getContext("2d");
    context.drawImage(sourceImgSelector, 0, 0);

    var newImageData = context.canvas.toDataURL(mimeType, quality);
    return newImageData;
  };

  function sizeToReadable(size) {
    return Math.round((size / 1024 / 1024) * 100) / 100 + " Mb" || 0;
  }

  function gotImageLoaded(img, callback) {
    if (!img.naturalWidth) {
      setTimeout(gotImageLoaded.bind(this), 200, img, callback.bind(this));
      return;
    }
    if (typeof callback === 'function') {
      return callback();
    }
  };

};

var page = new Page();