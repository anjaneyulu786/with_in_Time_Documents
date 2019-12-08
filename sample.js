// Image Choose function
function readURL(input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();

      reader.onload = function (e) {
        $('#profileImg')
          .attr('src', e.target.result);
      };

      reader.readAsDataURL(input.files[0]);
    } else {
      error: "File Not Supported..";
    }
  }

// Image Update And Save Function

function updateBusinessImage() {
    var filesSelected = document.getElementById("chooseImg").files;
    var srcData;
    if (filesSelected.length > 0) {
      var fileToLoad = filesSelected[0];
      var fileReader = new FileReader();
      fileReader.onload = function (fileLoadedEvent) {
        srcData = fileLoadedEvent.target.result;
        var newImage = document.createElement('businessImage');
        var business = {
          'businessId': $.session.get('businessId'),
          'businessImage': srcData
        };
        console.log("UsreObject::::::::::::", business);
        reqHandler.put({ url: "/ui/business", data: business }, function (response) {
          console.log("responce ::::", response);
         
        });
        newImage.src = srcData;
        document.getElementById("profileImg").innerHTML = newImage.outerHTML;
      }
      fileReader.readAsDataURL(fileToLoad);
    }
  }
