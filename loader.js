var s = document.createElement('script');
s.src = chrome.extension.getURL("jquery.js");
s.onload = function() {
	var s2 = document.createElement('script');
	s2.src = chrome.extension.getURL("jquery_resize.js");
	s2.onload = function() {
		var s3 = document.createElement('script');
		s3.src = chrome.extension.getURL("ott.js");
		s3.onload = function() {
			this.parentNode.removeChild(this);
		};
		(document.head||document.documentElement).appendChild(s3);
		this.parentNode.removeChild(this);
	};
	(document.head||document.documentElement).appendChild(s2);
    this.parentNode.removeChild(this);
};
(document.head||document.documentElement).appendChild(s);