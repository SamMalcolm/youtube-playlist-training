// Provide own API key //
// This key is a free one and you can generate your own easily //
var googleAPIKey = "AIzaSyCsdREJq6CTxnBK6miJxZQqD7zbUbWxot0";


var ytPlaylistId = document.querySelector(".youtube-playlist-training").getAttribute("data-yt-playlistid");
var videoInfo = {};
var yptMenuItem;
var yptDuration
var yptminutes;
var yptseconds;
var yptParser = new DOMParser();
var yptLine;
var player;
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


function setVisibleTranscriptById(videoId) {

}

function setActiveLinkById(videoId) {

}

function highlightCurrentTranscript() {

}

function setTranscriptEvents() {

}

function yptChannelInfo(channelId) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET","https://www.googleapis.com/youtube/v3/channels?part=snippet&id="+channelId+"&maxResults=1&key="+googleAPIKey);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status==200) {
            var yptPageInfo = {};
            var data = JSON.parse(xhr.responseText);
            yptPageInfo.channelIcon = data.items["0"].snippet.thumbnails.high.url;
            yptPageInfo.channelTitle = data.items["0"].snippet.title;
            yptPageInfo.channelDescription = data.items["0"].snippet.description;
            var channelInfoMarkup = "<img src=\""+yptPageInfo.channelIcon+"\" class=\"ypt-channel-icon\" />";
            channelInfoMarkup += "<p>"+yptPageInfo.channelTitle+"</p>";
            channelInfoMarkup += "<i>"+yptPageInfo.channelDescription+"</i>";
            document.querySelector(".ypt-channel-info").innerHTML += channelInfoMarkup;
        }


    }
    xhr.send();

}

function yptTranscriptInit(videoId) {
    document.querySelector(".ypt-transcript-container").innerHTML += "<div class=\"ypt-transcript\" data-video-id=\""+videoId+"\"></div>";

    var xhr = new XMLHttpRequest();
    xhr.open("GET","http://video.google.com/timedtext?lang=en&v="+videoId);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status==200) {
            var xmlTranscript=yptParser.parseFromString(xhr.responseText,"text/xml");
            var yptLines = xmlTranscript.getElementsByTagName("text");

            for (let i=0;i<yptLines.length;i++) {
                let innerText = yptLines[i].innerHTML.replace("&#39;","'");
                yptLine = "<span ";
                yptLine += "data-duration=\""+yptLines[i].getAttribute("dur")+"\" ";
                yptLine += "data-time=\""+yptLines[i].getAttribute("start")+"\" >";
                yptLine += innerText;
                yptLine += "</span>";
                document.querySelector("div.ypt-transcript[data-video-id='"+videoId+"']").innerHTML += yptLine;
            }

        }
}
    xhr.send();
}

function yptPlaylistInfo() {

    var xhr = new XMLHttpRequest();
    xhr.open("GET","https://www.googleapis.com/youtube/v3/playlists?part=snippet&id="+ytPlaylistId+"&maxResults=1&key="+googleAPIKey);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status==200) {
            var yptPageInfo = {};
            var data = JSON.parse(xhr.responseText);
            yptPageInfo.title = data.items["0"].snippet.title;
            yptPageInfo.channelId = data.items["0"].snippet.channelId;
            yptPageInfo.description = data.items["0"].snippet.description;
            yptPageInfo.theme = document.querySelector(".youtube-playlist-training").getAttribute("data-theme");
            yptChannelInfo(yptPageInfo.channelId);
            document.querySelector(".ypt-title-heading").innerHTML = yptPageInfo.title;
        }


    }
    xhr.send();

}

function yptInit() {
    if (document.querySelector(".youtube-playlist-training")) {
        var yptMenu = document.createElement("div");
        yptMenu.setAttribute("class","ypt-video-menu");

        var yptTitleContainer = document.createElement("div");
        yptTitleContainer.setAttribute("class","ypt-page-title");
        var yptTitleHeading = document.createElement("h1");
        yptTitleHeading.setAttribute("class","ypt-title-heading")
        yptTitleContainer.appendChild(yptTitleHeading);
        var yptChannelInfo = document.createElement("div");
        yptChannelInfo.setAttribute("class","ypt-channel-info");
        var yptInfoContainer = document.createElement("div");
        yptInfoContainer.setAttribute("class","ypt-page-info");
        var yptVideoContainer = document.createElement("div");
        yptVideoContainer.setAttribute("class","ypt-video-container");


        document.querySelector(".youtube-playlist-training").appendChild(yptTitleContainer);
        document.querySelector(".youtube-playlist-training").appendChild(yptVideoContainer);
        document.querySelector(".youtube-playlist-training").appendChild(yptMenu);
        document.querySelector(".youtube-playlist-training").appendChild(yptInfoContainer);
        document.querySelector(".ypt-page-title").appendChild(yptChannelInfo);
        document.querySelector(".ypt-video-container").innerHTML = "<div class=\"ypt-responsive-container\"><div id=\"ypt-player\"></div></div>";
        var yptTranscriptContainer = document.createElement("div");
        yptTranscriptContainer.setAttribute("class","ypt-transcript-container");
        document.querySelector(".ypt-page-info").appendChild(yptTranscriptContainer);

        yptPlaylistInfo();
        yptConstruction();
        } else {
            console.error("HTML does not contain target division")
        }



}

function formatDuration(duration) {

    duration = duration.slice(2,duration.length);
    if (duration.indexOf("M") !== -1) {
        if (duration.indexOf("M") == 1) {
            yptminutes = duration.slice(0,1);
        } else {
            yptminutes = duration.slice(0,2);
        }
    } else {
        yptminutes = "0";
    }
    if (duration.indexOf("S") !== -1) {
        if (duration.indexOf("M") == duration.indexOf("S")-3) {
            yptseconds = duration.slice(duration.length-3,duration.length-1);
        } else {
            yptseconds = duration.slice(duration.length-2,duration.length-1);
        }
    } else {
        yptseconds = "0";
    }

    if (yptminutes !== "0" && yptseconds !== "0") {
        return yptminutes+"m "+yptseconds+"s";
    }
    if (yptminutes == "0" && yptseconds !== "0") {
        return yptseconds+"s";
    }
    if (yptminutes !== "0" && yptseconds == "0") {
        return yptminutes+"m";
    }

    return yptminutes+"m "+yptseconds+"s";
}

function setDuration(videoId) {
    var duration;
    var xhr = new XMLHttpRequest();
    xhr.open("GET","https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id="+videoId+"&key="+googleAPIKey);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status==200) {
            var data = JSON.parse(xhr.responseText);
            duration = data.items["0"].contentDetails.duration;
            document.querySelector("a[data-video-id='"+videoId+"'] .ypt-menu-card .ypt-menu-text i.ypt-menu-duration").innerHTML = formatDuration(duration);
        }


    }
    xhr.send();

}

function buildMenuItem(videoInfo) {

    setDuration(videoInfo.videoId);
    yptMenuItem = "<a href=\"#\" class=\"ypt-video-trigger\" data-video-id=\""+videoInfo.videoId+"\">";
    yptMenuItem += "<div class=\"ypt-menu-card\">";
    yptMenuItem += "<div class=\"ypt-card-image\">";
    yptMenuItem += "<img src=\""+videoInfo.imguri+"\" />";
    yptMenuItem += "</div>";
    yptMenuItem += "<div class=\"ypt-menu-text\">";
    yptMenuItem += "<h1 class=\"ypt-menu-heading\">"+videoInfo.title+"</h1>";
    yptMenuItem += "<i class=\"ypt-menu-duration\"></i>";
    yptMenuItem += "</div></div></a>";
    setDuration(videoInfo.videoId);
    return yptMenuItem;


}

function yptConstruction() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails&maxResults=50&playlistId="+ytPlaylistId+"&key="+googleAPIKey);
    xhr.onreadystatechange = function() {
        if (xhr.status == 200 && xhr.readyState == 4) {
            var data = JSON.parse(xhr.responseText);
            for (var key in data.items) {
                if (data.items.hasOwnProperty(key)) {

                    videoInfo.title = data.items[key].snippet.title;
                    videoInfo.imguri = data.items[key].snippet.thumbnails.maxres.url;
                    videoInfo.videoId = data.items[key].contentDetails.videoId;
                    document.querySelector(".ypt-video-menu").innerHTML += buildMenuItem(videoInfo);
                    if (key == 0) {
                        yptLoadVideo(videoInfo.videoId);
                    }
                    yptTranscriptInit(videoInfo.videoId);
                }
            }

        }
    }

    xhr.send();
}

function onYouTubeIframeAPIReady() {
    player = new YT.Player('ypt-player', {
        height: '390',
        width: '640',
        'videoId':'Z-ulOvJ77zg',
        'params':{
            'rel':0
        },
        events: {
            'onReady': OnPlayerReady,
            'onStateChange': OnPlayerStateChange
          }
    });
}

function OnPlayerReady(event) {
    event.target.playVideo();
}

function OnPlayerStateChange(event) {


}

function stopVideo() {
    player.stopVideo();
}

function yptLoadVideo(videoId) {
    player.loadVideoById(videoId);
}

yptInit();
