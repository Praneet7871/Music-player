let songs;
let currfolder;
let currentSong = null;

async function getsongs(folder) {
  currfolder = folder;
  let a = await fetch(`/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let fetchedSongs = [];
  let as = div.getElementsByTagName("a");
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith("mp3")) {
      fetchedSongs.push(decodeURIComponent(element.href.split(`/${folder}/`)[1]));
    }
  }
  return fetchedSongs;
}

function playmusic(track, pause = false) {
  if (currentSong !== null) {
    currentSong.pause();
  }

  function formatTime(seconds) {
    let min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);
    return `${min < 10 ? "0" : ""}${min}:${sec < 10 ? "0" : ""}${sec}`;
  }

  var audio = new Audio(`/${currfolder}/${track}`);
  // var audio = new Audio(`https://yourusername.github.io/yourrepository/${currfolder}/${track}`);
  currentSong = audio;
  audio.play();
  
  // Update the song title
  let songName = track.replaceAll("%20", " ").replace(".mp3", "");
  document.querySelector(".songinfo").textContent = songName;

  audio.addEventListener("timeupdate", () => {
    let duration = audio.duration;
    let ctime = audio.currentTime;
    let formattedDuration = formatTime(duration);
    let formattedCurrentTime = formatTime(ctime);

    console.log(duration, audio.currentSrc, ctime);
    document.querySelector(".songtime").textContent =
      formattedCurrentTime + "/" + formattedDuration;
    let circle = document.querySelector(".circle");
    circle.style.left = (100 * ctime) / duration + "%";
    let progressbar = document.querySelector(".progressbar");
    progressbar.style.width = (100 * ctime) / duration + "%";

    let seek = document.querySelector(".seekbar");
    seek.addEventListener("click", (e) => {
      audio.currentTime = (e.offsetX / seek.offsetWidth) * duration;
    });
  });
}

function updateSongListUI(songs) {
  let songUL = document.querySelector(".songlist ul");
  songUL.innerHTML = ''; // Clear the existing list
  for (const song of songs) {
    songUL.innerHTML +=
      `<li>
        <div class="play">
          <img src="./assets/music.svg" height="70%">
          <div class="info">
            <div>${song.replaceAll("%20", " ").replace(".mp3", "")}</div>
          </div>
        </div>
        <img class="invert" src="./assets/play.svg" height="70%">
      </li>`;
  }

  // Add click event listeners to the new song list items
  Array.from(songUL.getElementsByTagName("li")).forEach((e) => {
    e.addEventListener("click", (element) => {
      let songName = e.querySelector(".info").firstElementChild.innerHTML;
      let songFileName = songName.replaceAll(" ", "%20") + ".mp3";
      console.log(songName);
      playmusic(songFileName);
      document.getElementById("play").src = "/assets/pause.svg";
    });
  });
}

async function main() {
  songs = await getsongs("songs/ncs");
  updateSongListUI(songs);

  document.getElementById("play").addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      document.getElementById("play").src = "/assets/pause.svg";
    } else {
      currentSong.pause();
      document.getElementById("play").src = "/assets/play.svg";
    }
  });

  document.getElementById("next").addEventListener("click", () => {
    console.log("next");
    let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").slice(-1)[0]));
    if (index + 1 < songs.length) {
      playmusic(songs[index + 1]);
    }
  });

  document.getElementById("previous").addEventListener("click", () => {
    console.log("previous");
    let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").slice(-1)[0]));
    if (index - 1 >= 0) {
      playmusic(songs[index - 1]);
    }
  });

  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      let folder = item.currentTarget.dataset.folder;
      console.log(item, item.currentTarget.dataset);
      songs = await getsongs(`songs/${folder}`);
      updateSongListUI(songs);
      document.querySelector(".left").style.left="0"
    });
  });
  document.querySelector(".menu").addEventListener("click",()=>{
    document.querySelector(".left").style.left="0"
  })
  document.querySelector(".cross").addEventListener("click",()=>{
    document.querySelector(".left").style.left="-100%"
  })
}

main();
