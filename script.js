// Provide own API key //
// This key is a free one and you can generate your own easily //

const getAPIKey = () => {
    var xhr = new XMLHttpRequest();
    xhr.open("GET","credentials.json");
    // {
    //     "api_key":API_KEY_HERE
    // }
    xhr.onreadystatechange = function() {
        if (xhr.status === 200 && xhr.readyState === 4) {
            try {
                let json = JSON.parse(xhr.responseText);
                console.log(json.api_key);
                return json.api_key;
            }
            catch (err) {
                console.error(err);
                return false;
            }
        }
    }
    xhr.send();
}

var googleAPIKey = getAPIKey();

if (document.querySelector(".youtube-playlist-training").getAttribute("data-p") == "true") {
    var playlist = true;
    var single_video = false;
    var ytPlaylistId = document.querySelector(".youtube-playlist-training").getAttribute("data-yt-playlistid");
}
//var yptVideoId = document.querySelector(".youtube-playlist-training").getAttribute("data-yt-videoid");


var videoInfo = {};
var yptMenuItem;
var yptDuration;
var yptminutes;
var yptseconds;
var yptParser = new DOMParser();
var yptLine;
var player;

var transcripts;
var transcriptContainers;

function removeSelectedClass() {
    var cards = document.querySelectorAll(".ypt-menu-card"); 
    for (let i=0;i<cards.length;i++) {
        cards[i].classList.remove("ypt-selected");
    }
}

function addEventsToMenu() {
    var triggers = document.querySelectorAll(".ypt-video-trigger");
    for (let i=0;i<triggers.length;i++) {
        triggers[i].addEventListener("click", function(e) {
            e.preventDefault();
            player.loadVideoById(this.getAttribute("data-video-id"));
            removeSelectedClass();
            this.childNodes[0].classList.add('ypt-selected');
        }, false);
    }
}

function showCorrectCustomMarkup(video_id) {
    var customMarkupDivs = document.querySelectorAll(".ypt-custom-data");
    for (let i=0;i<customMarkupDivs.length;i++) {
        if (customMarkupDivs[i].getAttribute("data-video-id") !== video_id) {
            customMarkupDivs[i].style.display = "none";
        } else {
            customMarkupDivs[i].style.display = "block";
        }
    }

}
function getCustomData() {
    var xhr = new XMLHttpRequest();
    if (playlist) {
        xhr.open("GET",ytPlaylistId+".json");
    } else {
        xhr.open("GET",ytSingleId+".json");
    }
    xhr.onreadystatechange = function() {
        if (xhr.status == 200 && xhr.readyState == 4) {
            var json = JSON.parse(xhr.responseText);
            console.log(json);
            var customDataMarkup = "";
            for (let i=0;i<json.length;i++) {
                customDataMarkup = "<div class=\"ypt-custom-data\" data-video-id=\""+json[i].video_id+"\" >";
                
                if (typeof json[i].extra_html !== 'undefined') {
                    customDataMarkup += "<div class=\"ypt-custom-html\">";
                    customDataMarkup += "<h3>Extra Info: </h3>";
                    customDataMarkup += json[i].extra_html;
                    customDataMarkup += "</div>";
                }
                if (typeof json[i].extra_resources !== 'undefined') {
                    customDataMarkup += "<div class=\"ypt-custom-links\">";
                    customDataMarkup += "<h3>Dive Deeper: </h3>";
                    customDataMarkup += "<dl>";
                    for (let a = 0;a < json[i].extra_resources.length;a++) {
                        customDataMarkup += "<dt>"+json[i].extra_resources[a].description+"</dt>";
                        customDataMarkup += "<dd><a href=\""+json[i].extra_resources[a].link+"\" >"+json[i].extra_resources[a].link+"</a></dd>";
                    }
                    customDataMarkup += "</dl>";
                    customDataMarkup += "</div>";
                }
                customDataMarkup += "</div>";
            }
            document.querySelector(".ypt-page-info").innerHTML += customDataMarkup;
        }
    }
    

    xhr.send();
}

function setVisibleTranscriptById(videoId) {
    transcripts = document.querySelectorAll(".ypt-transcript span");
    transcriptContainers = document.querySelectorAll("div.ypt-transcript");
    console.log("visible transcript");
    for (let i= 0;i<transcriptContainers.length;i++) {
        if (transcriptContainers[i].getAttribute("data-video-id") !== videoId) {
            transcriptContainers[i].style.display="none";
        } else {
            transcriptContainers[i].style.display="block";
        }
        
    }
}


function highlightCurrentTranscript() {
    let playerdata = player.getVideoData();
    let video_id = playerdata.video_id;
    let current_time = player.getCurrentTime();
    var not_done = true;
    let currentTranscript = document.querySelectorAll(".ypt-transcript[data-video-id='"+video_id+"'] span");
    for (let i=0;i<currentTranscript.length;i++) {
        if (currentTranscript[i].getAttribute("data-time") > current_time && not_done) {
            if (typeof currentTranscript[i-1] !== 'undefined') {
                currentTranscript[i-1].classList.add("ypt-active");
            } else {
                currentTranscript[i].classList.add("ypt-active");
            }
            
            not_done = false;
        } else {
            if (currentTranscript[i].classList.contains("ypt-active")) {
                currentTranscript[i].classList.remove("ypt-active")
            }
        }
    }
}

function setTranscriptEvents() {
    
    for (let i= 0;i<transcripts.length;i++) {
        transcripts[i].addEventListener("click", function (e) {
            e.preventDefault();
            player.seekTo(this.getAttribute("data-time"));
            player.playVideo();
        }, false);  
    }
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
                setTranscriptEvents();
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
        getCustomData();
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

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
        var menuInfoContainer = document.createElement("div");
        menuInfoContainer.setAttribute("class","ypt-data-container");
        var headerContainer = document.createElement("div");
        headerContainer.setAttribute("class", "ypt-header-container");

        document.querySelector(".youtube-playlist-training").appendChild(headerContainer);
        document.querySelector(".ypt-header-container").appendChild(yptTitleContainer);
        document.querySelector(".youtube-playlist-training").appendChild(yptVideoContainer);
        document.querySelector(".youtube-playlist-training").appendChild(menuInfoContainer);
        document.querySelector(".ypt-data-container").appendChild(yptMenu);
        document.querySelector(".ypt-data-container").appendChild(yptInfoContainer);
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

function ysvInit() {
    
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
                    //if (key == 0) {
                    //    yptLoadVideo(videoInfo.videoId);
                    //}
                    yptTranscriptInit(videoInfo.videoId);
                    addEventsToMenu();
                }
            }

        }
    }

    xhr.send();
}

if (playlist && !single_video) {
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
        setVisibleTranscriptById('Z-ulOvJ77zg');
        var tscript_timer = setInterval(highlightCurrentTranscript,300);
    }
} else {
    function onYouTubeIframeAPIReady() {
        player = new YT.Player('ypt-player', {
            height: '390',
            width: '640',
            'videoId':yptVideoId,
            'params':{
                'rel':0
            },
            events: {
                'onReady': OnPlayerReady,
                'onStateChange': OnPlayerStateChange
              }
        });
        setVisibleTranscriptById(yptVideoId);
        var tscript_timer = setInterval(highlightCurrentTranscript,300);
    }
}


function OnPlayerReady(event) {
    event.target.playVideo();
}

function OnPlayerStateChange(event) {
    console.log(player);
    let id = player.getVideoData();
    id = id.video_id;
    let ct = player.getCurrentTime();
    highlightCurrentTranscript();
    setVisibleTranscriptById(id);
    showCorrectCustomMarkup(id);

    // if autoplay, play next video based on selected

}

function stopVideo() {
    player.stopVideo();
}

function yptLoadVideo(videoId) {
    player.loadVideoById(videoId);
}
if (playlist && !single_video) {
    yptInit();
} else {
    ysvInit();
}

