console.log("Let's write javascript");
var audio = new Audio();
let songs = [];
let currentsongIndex = 0;

async function getSongs() {
  try {
    const response = await fetch("songs.json");
    // “Give me the entire HTML text of the response.”
    songs = await response.json();
    showSongs();
  } catch (error) {
    //   let div = document.createElement("div");
    //   div.innerHTML = response;
    //   let as = div.getElementsByTagName("a");
    //   for (let i = 0; i < as.length; i++) {
    //     if (as[i].href.endsWith(".mp3")) {
    //       songs.push(as[i].href);
    //     }
    //   }
    console.error("Could not load songs.json", error);
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

getSongs(); // Call to fetch and start everything

// Making the songinfo() function so that the  buttons are not pushed down each time the song name comes on the play bar
function songinfo() {
  let songinfo = document.querySelector(".songinfo");
  songinfo.style.visibility = "hidden";
  if (audio.play()) {
    songinfo.style.visibility = "visible";
  }
}
songinfo();

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
    currentTimeText.textContent = `${formatTime(audio.currentTime)} / `;
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
    document.querySelector(".progressbar").style.width = `${progressPercent}%`;
    document.querySelector(".circle").style.left = `${progressPercent}%`;
  });
}
clickseekbar();
