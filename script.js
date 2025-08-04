console.log("Let's write javascript");
var audio = new Audio();
let songs = [];
let currentsongIndex = 0;

async function showAlbums() {
	const albumsList = document.querySelector(".albums");
	try {
		const response = await fetch("songs/albums.json");
		const albums = await response.json();

		albums.forEach((album) => {
			const albumCard = document.createElement("div");
			albumCard.className = "albumCard";

			albumCard.innerHTML = `
        <div class="play"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                color="#000000" fill="black">
                <path
                  d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                  stroke="#141B34" stroke-width="1.5" stroke-linejoin="round" />
              </svg></div>
    <img src="${album.cover}" alt="${
				album.name
			}" style="width:100%; border-radius:8px; margin-bottom:0.5rem; ">
    <div class="albumName">${album.displayName}</div>
		 <p class="albumDesc">${album.desc || ""}</p>
  `;
			albumCard.addEventListener("click", () => loadAlbum(album.name));
			albumsList.appendChild(albumCard);
		});
	} catch (error) {
		console.log("Could not load albums.json", error);
	}
}
async function loadAlbum(albumName) {
	try {
		let response = await fetch(`songs/${albumName}/songs.json`);
		songs = await response.json();
		showSongs();
		playSong(0);
	} catch (error) {
		console.log(`Could not load songs from album ${albumName}`, error);
	}
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
		<div style="display: flex; justify-content: space-between; align-items: center; gap:6px">
		<span >Play</span>
		<span class="playBtnsvg invert" ><img src="play.svg" alt=""></span>
      </div>
  </div>
`;

		div.addEventListener("click", () => {
			playSong(index);
		});
		songList.appendChild(div);
	});
	//  Called after songItems are created
	setUpSongItemClose();
}

function playSong(index) {
	currentsongIndex = index;
	audio.src = songs[index];
	audio.play();
	showDuration();
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
		playImg.src = "playbuttons.svg";
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

showAlbums(); // Call to fetch and start everything
audio.addEventListener("play", songinfo);
audio.addEventListener("pause", songinfo);
// Making the songinfo() function so that the  buttons are not pushed down each time the song name comes on the play bar
function songinfo() {
	let songinfo = document.querySelector(".songinfo");
	let music = document.querySelector(".music");
	console.log("Audio paused?", audio.paused);
	if (audio.ended) {
		music.style.visibility = "hidden";
		songinfo.style.visibility = "hidden";
	} else {
		music.style.visibility = "visible";
		songinfo.style.visibility = "visible";
	}
}
//  songinfo() should only run when triggered by play, pause, or ended events
audio.addEventListener("play", songinfo);
audio.addEventListener("pause", songinfo);
audio.addEventListener("ended", songinfo);

// Time duration of song
function showDuration() {
	//  convert seconds to minutes:seconds
	function formatTime(seconds) {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
	}

	const durationText = document.getElementById("duration");
	const currentTimeText = document.getElementById("currentTime");
	let circle = document.querySelector(".circle");
	let progressbar = document.querySelector(".progressbar");

	// Duration is available only after metadata is loaded
	// or
	// When metadata is loaded, show duration
	audio.addEventListener("loadedmetadata", () => {
		durationText.textContent = formatTime(audio.duration);
	});

	// Update current time every second
	audio.addEventListener("timeupdate", () => {
		currentTimeText.textContent = `${formatTime(audio.currentTime)} /   `;
		// Move the circle on the seekbar
		const progress = (audio.currentTime / audio.duration) * 100;
		circle.style.left = `${progress}%`;
		progressbar.style.width = `${progress}%`;
	});
}
function clickseekbar() {
	let seekbar = document.querySelector(".seekbar");
	seekbar.addEventListener("click", (e) => {
		const seekbarWidth = seekbar.clientWidth;
		const clickX = e.offsetX;
		const clickPercent = clickX / seekbarWidth;
		const newTime = clickPercent * audio.duration;
		audio.currentTime = newTime;
		const progressbar = clickPercent * 100;
		document.querySelector(".progressbar").style.width = `${progressbar}%`;
		document.querySelector(".circle").style.left = `${progressbar}%`;
	});
}
clickseekbar();

function adjustVolume() {
	const volbar = document.querySelector(".volbar");
	const volFill = document.querySelector(".volFill");
	volbar.addEventListener("click", (e) => {
		const volbarwidth = volbar.clientWidth;
		const clickX = e.offsetX;
		const volume = clickX / volbarwidth;
		audio.volume = volume;

		volFill.style.width = `${volume * 100}%`;
	});
	const volume = document.querySelector(".volume img");
	volume.src = "sound.svg";
	volume.addEventListener("click", function () {
		if (volume.src.includes("sound.svg")) {
			volume.src = "mute.svg";
			audio.muted = true;
			volFill.style.width = "0%";
		} else {
			volume.src = "sound.svg";
			audio.muted = false;
			volFill.style.width = "50%";
		}
	});
}
adjustVolume();
function hamburger() {
	let hamburger = document.querySelector(".hamburger");
	const close = document.querySelector(".close");
	const left = document.querySelector(".left");

	hamburger.addEventListener("click", () => {
		left.classList.add("show");
	});

	close.addEventListener("click", () => {
		left.classList.remove("show");
	});
}
function setUpSongItemClose() {
	const left = document.querySelector(".left");
	let songItems = document.querySelectorAll(".songItem");

	songItems.forEach((item) => {
		item.addEventListener("click", () => {
			left.classList.remove("show");
		});
	});
}
hamburger();

const mq = window.matchMedia("(max-width: 1000px)");
const header = document.querySelector(".header");

function handleHeaderBorder() {
	if (mq.matches) {
		header.classList.remove("rounded");
	} else {
		header.classList.add("rounded");
	}
}

// Call once when page loads
handleHeaderBorder(mq);

// Listen for changes (resizing screen)
mq.addEventListener("change", handleHeaderBorder);

const meq = window.matchMedia("(max-width: 500px)");

function hideVolbar() {
	const volbar = document.querySelector(".volbar");
	const volume = document.querySelector(".volume");

	if (!volbar || !volume) return; // safety check

	function showVolbar() {
		console.log("Hovered over volume");
		volbar.style.width = "50px";
	}

	function hideVolbarNow() {
		volbar.style.width = "0";
	}

	function applyHoverEffect() {
		// Add listeners only once
		volume.addEventListener("mouseenter", showVolbar);
		volume.addEventListener("mouseleave", hideVolbarNow);
		hideVolbarNow(); // hide initially
	}

	function removeHoverEffect() {
		volume.removeEventListener("mouseenter", showVolbar);
		volume.removeEventListener("mouseleave", hideVolbarNow);
		volbar.style.width = ""; // reset style
	}

	if (meq.matches) {
		applyHoverEffect();
	} else {
		removeHoverEffect();
	}
}
hideVolbar();
// Update on screen resize too
meq.addEventListener("change", hideVolbar);

function playBarControl() {
	let playbar = document.querySelector(".playbar");
	let songItems = document.querySelectorAll(".songItem");
	function showPlayBar() {
		playbar.style.display = "block";
	}
	function hidePlayBar() {
		playbar.style.display = "none";
	}

	if (meq.matches) {
		hidePlayBar();
		songItems.forEach((item) => {
			item.addEventListener("click", showPlayBar);
		});
	} else {
		showPlayBar();
	}
}
playBarControl();
meq.addEventListener("change", playBarControl);
