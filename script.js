var googleAPIKey = "AIzaSyCsdREJq6CTxnBK6miJxZQqD7zbUbWxot0";
var ytPlaylistId = "PLT_xscTFmzgouW4pokUU1bfOUdNNyy00t"

var xhr = new XMLHttpRequest();

xhr.open("GET", "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails&maxResults=50&playlistId="+ytPlaylistId+"&key="+googleAPIKey);
xhr.onreadystatechange = function() {
    console.log("ready state: "+xhr.readyState);
    console.log("status: "+xhr.status);
    if (xhr.status == 200 && xhr.readyState == 4) {
        var data = JSON.parse(xhr.responseText);
        console.log(data);
        for (var key in data.items) {
            if (data.items.hasOwnProperty(key)) {
                console.log(data.items[key]);
                console.log("Video "+key+": "+data.items[key].snippet.title);
            }
        }

    }
}

xhr.send();
