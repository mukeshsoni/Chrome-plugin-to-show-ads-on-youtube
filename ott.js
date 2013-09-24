var BRIZZ_TV = {
	timeOuts: [],
	adConfig: {},
	init: function() {
		youtube_id_from_url(window.location.search);
		$('embed').attr('wmode', 'opaque');
		this.getAdConfigFile();

		$('#player-api').resize(function(){
			BRIZZ_TV.resetAdPositions();
			// console.log("player resized");
		});
	},
	getAdConfigFile: function() {
		// var videoId =

		var fd = new FormData();

		fd.append("video_id", brizzConfig.videoId);
		console.log("attached video id");


		$.getJSON(brizzConfig.ad_config_url+brizzConfig.videoId+'&callback=?', function(response) {
			console.log(response);
			BRIZZ_TV.adConfig = response;
		});
	},
	onytplayerStateChange: function(newState) {
		console.log("Player state changed: " + newState);
		switch(newState) {
			case 0: case 1: case 4:
				console.log("Playing");
				$('#overlay-ad-fullsize').hide();
				clearTimeOuts();
				initiateAdTimers();
				break;
			case 2:
				console.log("Paused");
				clearTimeOuts();
				break;
			case 3:
				console.log("Buffering");
				break;
		}
	},
	onytplayerQualityChange: function(newPlaybackQuality) {
		console.log("Playback quality changed to: " + newPlaybackQuality);
	},
	resetAdPositions: function() {
		$('#overlay-ad').css('top', $('#player-api').height()-100-$('#player-api').offset().top+30);
		$('#overlay-ad-fullsize').css('height', $('#player-api').height()-65);
		$('#overlay-ad-fullsize').css('width', $('#player-api').width()-65);
	}
};

var brizzConfig = {
					'ad_config_url':'http://ads.brizztv.com/get_ott_config_youtube.php?video_id=',
					'ad_image_baseurl':'http://localhost/tvads/adImages/'
				};

$(document).ready(function(){
	BRIZZ_TV.init();
});




function onYouTubePlayerReady(playerId) {
	console.log("this on works too");
    var currentVideo = document.getElementById("movie_player");
    currentVideo.addEventListener("pause", function(){alert("paused");});
    currentVideo.addEventListener("onStateChange", "BRIZZ_TV.onytplayerStateChange");
    currentVideo.addEventListener("onPlaybackQualityChange", "BRIZZ_TV.onytplayerQualityChange");

    $('#player-api').prepend($('<div id="overlay-ad"><img src="http://ads.brizztv.com/adImages/1.png"></img></div>'));
    $('#player-api').prepend($('<div id="overlay-ad-fullsize"><div id="btv-close-box">Close X</div><img></img></div>'));
    $('#btv-close-box').on('click', function(e){
    	hideLargeAd();
    	// initiateAdTimers();
    	playVideo();
    	// restartTimers();
    	e.stopPropagation();
    });

}

function clearTimeOuts() {
	console.log("clearing all timeouts");
	timeoutCount = BRIZZ_TV.timeOuts.length;

	for(var i=0; i<timeoutCount; i++) {
		console.log("clearing timeout: " + BRIZZ_TV.timeOuts[i]);
		clearTimeout(BRIZZ_TV.timeOuts[i]);
	}

	BRIZZ_TV.timeOuts = [];
}

function initiateAdTimers() {
	console.log("initiateAdTimers");
	var video = $('#movie_player')[0];
	var currentTime = Math.ceil(video.getCurrentTime()*1000);
	console.log("initiateAdTimers 2");
	var adCount = BRIZZ_TV.adConfig.ads.length;

	console.log("Current Play time: " + currentTime + " ad count: " + adCount);

	var imagePath, url;

	for(var i=0; i<adCount; i++) {
		// imagePath = brizzConfig.ad_image_baseurl + brizzConfig.videoId + "/" + adConfig.ads[i].img_path;

		// imagePath = BRIZZ_TV.adConfig.ads[i].img_path;
		imagePathThumb = BRIZZ_TV.adConfig.ads[i].img_path_thumb;
		imagePathFullsize = BRIZZ_TV.adConfig.ads[i].img_path_fullsize;

		console.log("Image path for ad image " + i + ": " + imagePathThumb);
		url = BRIZZ_TV.adConfig.ads[i].url;

		if(BRIZZ_TV.adConfig.ads[i].end_time > currentTime) {
			adStartTime = Math.max(0, BRIZZ_TV.adConfig.ads[i].start_time - currentTime);
			adEndTime = BRIZZ_TV.adConfig.ads[i].end_time - currentTime;
			console.log("About to set timeout from: " + adStartTime + " to: " + adEndTime);
			doSetTimeOut(imagePathThumb, imagePathFullsize, url, adStartTime);

			BRIZZ_TV.timeOuts.push(setTimeout(function(){hideAd();}, adEndTime));
		}
	}
}

function playVideo() {
	$('#movie_player')[0].playVideo();
}

function hideLargeAd() {
	$('#overlay-ad-fullsize').hide();
}

function showAd(imagePathThumb, imagePathFullsize, url) {
	console.log("about to show ad on path: " + imagePathThumb + " with ur: " + url);
	$('#overlay-ad img').attr('src', imagePathThumb).width('100px');

	if($('#overlay-ad').is(":hidden")) {
		$('#overlay-ad').show();
		// $('#overlay-ad').show("slide", {direction: "left"}, 1000);
	}

	$('#overlay-ad').css('top', $('#player-api').height()-100-$('#player-api').offset().top+30);
	$('#overlay-ad-fullsize').css('height', $('#player-api').height()-65);
	$('#overlay-ad-fullsize').css('width', $('#player-api').width()-65);

	$('#overlay-ad').unbind("click").click(function(){
		if(url.indexOf('http://') < 0) {
			window.open("http://"+url);
		} else {
			window.open(url);
		}
	});

	$('#overlay-ad').unbind("mousemove").mousemove(function(e){
		var offset = $(this).offset();
		var mouseX = parseInt(e.pageX-offset.left, 10);
		var mouseY = parseInt(e.pageY-offset.top, 10);
		console.log('you hovering?:');
		console.log("X-Coordinate: " + mouseX);
		console.log("Y-Coordinate: " + mouseY);

		if(mouseX >= 25 && mouseX <= 75 && mouseY >= 25 && mouseY <= 75) {
			pauseVideo();
			clearTimeOuts();
			showFullScreenAd(imagePathFullsize);
		}

	});

	$('#overlay-ad-fullsize').unbind("click").click(function(){
		if(url.indexOf('http://') < 0) {
			window.open("http://"+url);
		} else {
			window.open(url);
		}
	});
}

function showFullScreenAd(imagePath) {
	$('#overlay-ad-fullsize img').attr('src', imagePath);
	$('#overlay-ad-fullsize').css({'z-index': 10001}).show();
}

function pauseVideo() {
	$('#movie_player')[0].pauseVideo();
}

function hideAd() {
	console.log("About to hide ad");
	// $('#overlay-ad').hide('slide', {direction: 'left'}, 1000);
	$('#overlay-ad').hide();
}

function doSetTimeOut(imagePathThumb, imagePathFullsize, url, delay) {
	console.log("About to set timeout no: "  + BRIZZ_TV.timeOuts.length);
	BRIZZ_TV.timeOuts.push(setTimeout(function() {
			showAd(imagePathThumb, imagePathFullsize, url);
		}, delay));
}

function clearTimeOuts() {
	console.log("clearing all timeouts");
	timeoutCount = BRIZZ_TV.timeOuts.length;

	for(var i=0; i<timeoutCount; i++) {
		console.log("clearing timeout: " + BRIZZ_TV.timeOuts[i]);
		clearTimeout(BRIZZ_TV.timeOuts[i]);
	}

	BRIZZ_TV.timeOuts = [];
}

/**
 * get youtube video ID from URL
 *
 * @param string $url
 * @return string Youtube video id or FALSE if none found.
 */
function youtube_id_from_url(url) {
	var video_id = url.split('v=')[1];
	var ampersandPosition = video_id.indexOf('&');
	if(ampersandPosition != -1) {
		video_id = video_id.substring(0, ampersandPosition);
	}
	brizzConfig.videoId = video_id;
	return video_id;
}