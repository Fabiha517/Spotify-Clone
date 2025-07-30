console.log("Let's write javascript");
var audio = new Audio();
let songs = [];
let currentsongIndex = 0;

async function getSongs() {
	let a = await fetch("./songs/");
	// “Give me the entire HTML text of the response.”
	let response = await a.text();
	console.log(response);
	let div = document.createElement("div");
	div.innerHTML = response;
	let as = div.getElementsByTagName("a");
	for (let i = 0; i < as.length; i++) {
		if (as[i].href.endsWith(".mp3")) {
			songs.push(as[i].href);
		}
	}
	showSongs();
}

function showSongs() {
	let songList = document.querySelector(".songList");
	songList.innerHTML = "";

	songs.forEach((url, index) => {
		let name = decodeURIComponent(url.split("/").pop().replace(".mp3", ""));
		let [songTitle, artistName] = name.split("_");
		songTitle = songTitle.replaceAll("-", " ").trim();
		artistName = artistName ? artistName.trim() : "Unknown artist";
		let div = document.createElement("div");
		div.className = "songItem";
		div.innerHTML = `
		 <div style="display: flex; justify-content: space-between; align-items: center;">
  <div style="display: flex; align-items: center; gap: 10px;">
    <span class="musicsvg invert">
      <img src="music.svg" alt="">
    </span>
		 
    <div>
      <div style="font-weight: bold; ">${songTitle}</div>
      <div style="font-size: 0.85rem;">${artistName}</div>
    </div>
		</div>
		<div>
		 <span class="playBtnsvg invert" ><img src="play.svg" alt=""></span>
       </div>
  </div>
`;

		div.addEventListener("click", () => {
			playSong(index);
		});
		songList.appendChild(div);
	});
}
function playSong(index) {
	currentsongIndex = index;
	audio.src = songs[index];
	audio.play();
	let fullname = decodeURIComponent(
		songs[index].split("/").pop().replaceAll(".mp3", "")
	);
	let [songTitle] = fullname.split("_");
	songTitle = songTitle.replaceAll("-", " ").trim();
	document.querySelector(".songinfo").innerText = songTitle;
	// Update play button to show pause icon
	document.querySelector(".playsvg img").src = "pause.svg";
}
// ▶️ Play button
document.querySelector(".playsvg").addEventListener("click", () => {
	let playImg = document.querySelector(".playsvg img");
	if (audio.paused) {
		audio.play();
		playImg.src = "pause.svg";
	} else {
		audio.pause();
		playImg.src = "play.svg";
	}
});

// ⏭ Next song
document.querySelector(".nextsong").addEventListener("click", () => {
	if (currentsongIndex < songs.length - 1) {
		playSong(currentsongIndex + 1);
	} else {
		playSong(0);
	}
});

// ⏮ Previous song
document.querySelector(".prevsong").addEventListener("click", () => {
	if (currentsongIndex > 0) {
		playSong(currentsongIndex - 1);
	} else {
		playSong(songs.length - 1);
	}
});

getSongs(); // Call to fetch and start everything
