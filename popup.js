brizzTvConfig = {};

chrome.tabs.getSelected(null, function(tab) {
   // alert(tab.url);
   brizzTvConfig.videoId = youtube_id_from_url(tab.url);
   // console.log(tab.url);
});

function youtube_id_from_url(url) {
	var video_id = url.split('v=')[1];
	var ampersandPosition = video_id.indexOf('&');
	if(ampersandPosition != -1) {
		video_id = video_id.substring(0, ampersandPosition);
	}
	return video_id;
}

function uploadToServer(e) {
	// alert("hi");
	e.preventDefault();
	var from_time = $('#from-time');
	var to_time = $('#to-time');
	var file_to_upload = $('#image-to-upload');

	if(from_time.val() === undefined || from_time.val().trim() === '') {
		$('#errors').empty().text("Please enter the from time").show();
	} else if(to_time.val() === undefined || to_time.val().trim() === '') {
		$('#errors').empty().text("Please enter the to time").show();
	} else if(file_to_upload.val() === undefined || file_to_upload.val().trim() === '') {
		$('#errors').empty().text("Please select an image to upload").show();
	}
}

function init() {
    var uploadButton = document.querySelector('#upload-to-btv');
    // dialog = document.querySelector('#dialog');

    uploadButton.addEventListener('click', uploadToServer, false);
    // dialog.addEventListener('click', showDialog, false);
}

document.addEventListener('DOMContentLoaded', init);


	// $('#uploda-to-btv').click(function(){});
// };