var googleAPIKey = "AIzaSyCsdREJq6CTxnBK6miJxZQqD7zbUbWxot0";
var ytPlaylistId = document.querySelector(".youtube-playlist-training").getAttribute("data-yt-playlistid");

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

        document.querySelector(".youtube-playlist-training").appendChild(yptTitleContainer);
        document.querySelector(".youtube-playlist-training").appendChild(yptMenu);
        document.querySelector(".ypt-page-title").appendChild(yptChannelInfo);
        yptPlaylistInfo();
        yptConstruction();
        } else {
            console.error("HTML does not contain target division")
        }



}
var yptminutes;
var yptseconds;

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
            console.log(duration);
            document.querySelector("a[data-video-id='"+videoId+"'] .ypt-menu-card .ypt-menu-text i.ypt-menu-duration").innerHTML = formatDuration(duration);
        }


    }
    xhr.send();

}
var yptMenuItem;
var yptDuration
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
var videoInfo = {

};
var xhr = new XMLHttpRequest();
function yptConstruction() {
xhr.open("GET", "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails&maxResults=50&playlistId="+ytPlaylistId+"&key="+googleAPIKey);
xhr.onreadystatechange = function() {
    console.log("ready state: "+xhr.readyState);
    console.log("status: "+xhr.status);
    if (xhr.status == 200 && xhr.readyState == 4) {
        var data = JSON.parse(xhr.responseText);
        for (var key in data.items) {
            if (data.items.hasOwnProperty(key)) {
                videoInfo.title = data.items[key].snippet.title;
                videoInfo.imguri = data.items[key].snippet.thumbnails.maxres.url;
                videoInfo.videoId = data.items[key].contentDetails.videoId;
                document.querySelector(".ypt-video-menu").innerHTML += buildMenuItem(videoInfo);
            }
        }

    }
}

xhr.send();
}
yptInit();
