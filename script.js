// Đổi nền
const backgrounds = ["background1.jpg","background2.jpg","background3.jpg"];
let currentBg = 0;
function changeBackground(){
    currentBg = (currentBg+1) % backgrounds.length;
    document.body.style.backgroundImage = `url(images/${backgrounds[currentBg]})`;
}

// Khởi tạo: đảm bảo audio có src từ select khi load trang và khởi tạo volume
(function initMusicSelect(){
    const sel = document.getElementById("musicSelect");
    const music = document.getElementById("bgMusic");
    const btn = document.getElementById("playPauseBtn");
    if(!music) return;
    if(sel && sel.value){
        music.src = sel.value;
    } else if(!music.src){
        music.src = "music/ocean.mp3";
    }

    // volume restore
    const saved = localStorage.getItem("ho_ca_volume");
    const slider = document.getElementById("volumeRange");
    const vol = saved !== null ? Number(saved) : (slider ? Number(slider.value) : 0.5);
    music.volume = Math.max(0, Math.min(1, vol));
    if(slider) slider.value = music.volume;
    const disp = document.getElementById("volumeValue");
    if(disp) disp.textContent = Math.round(music.volume * 100) + "%";

    // set initial play button text/class
    if(btn){
        if(music.paused){
            btn.classList.remove("playing");
            btn.textContent = "Phát nhạc";
        } else {
            btn.classList.add("playing");
            btn.textContent = "Ngưng nhạc";
        }
    }
})();

// helper: update play button text and class
function updatePlayButton(isPlaying){
    const btn = document.getElementById("playPauseBtn");
    if(!btn) return;
    if(isPlaying){
        btn.classList.add("playing");
        btn.textContent = "Tạm ngưng nhạc";
    } else {
        btn.classList.remove("playing");
        btn.textContent = "Phát nhạc";
    }
}

// Phát/Tắt nhạc (cập nhật trạng thái nút)
function toggleMusic(){
    const music = document.getElementById("bgMusic");
    if(!music) return;
    if(music.paused){
        music.play();
        updatePlayButton(true);
    } else {
        music.pause();
        updatePlayButton(false);
    }
}

// Hàm chuyển nhạc khi chọn trong select
function changeMusic(){
    const sel = document.getElementById("musicSelect");
    const music = document.getElementById("bgMusic");
    if(!sel || !music) return;
    const wasPlaying = !music.paused;
    music.src = sel.value;
    music.load();
    if(wasPlaying){
        music.play();
        updatePlayButton(true);
    } else {
        updatePlayButton(false);
    }
}

// Hàm thay đổi âm lượng (gọi từ input range)
function changeVolume(e){
    const music = document.getElementById("bgMusic");
    const slider = (typeof e === "object" && e.target) ? e.target : document.getElementById("volumeRange");
    if(!music || !slider) return;
    const value = Number(slider.value);
    music.volume = Math.max(0, Math.min(1, value));
    const disp = document.getElementById("volumeValue");
    if(disp) disp.textContent = Math.round(music.volume * 100) + "%";
    try { localStorage.setItem("ho_ca_volume", String(music.volume)); } catch(e){}
}

// Tạo bong bóng ngẫu nhiên
function createBubbles(){
    const container = document.getElementById("bubbles");
    if(!container) return;
    container.innerHTML = "";
    for(let i=0; i<30; i++){
      const bubble = document.createElement("div");
      bubble.classList.add("bubble");
      const size = 10 + Math.random()*20;
      bubble.style.width = bubble.style.height = size + "px";
      bubble.style.left = Math.random()*(window.innerWidth - size) + "px";
      bubble.style.animationDuration = (6+Math.random()*6) + "s";
      container.appendChild(bubble);
    }
}
createBubbles();

// Helper: init và set flip an toàn trên ảnh con
function initFlipOnImage(containerEl, baseFlip = 1){
    const img = containerEl.querySelector && containerEl.querySelector('img');
    const target = img || containerEl;
    if (!target.dataset._origTransform) {
        const cs = getComputedStyle(target);
        let t = (cs.transform === 'none') ? '' : cs.transform;
        t = t.replace(/scaleX\([^)]*\)/g, '').replace(/matrix\(\s*-1[^)]*\)/g, '').trim();
        target.dataset._origTransform = t;
    }
    target.dataset._baseFlip = baseFlip;
}

function setFlipOnImage(containerEl, sx){
    const img = containerEl.querySelector && containerEl.querySelector('img');
    const target = img || containerEl;
    const orig = target.dataset._origTransform || '';
    const base = Number(target.dataset._baseFlip) || 1;
    target.style.transform = (orig + ' scaleX(' + (sx * base) + ')').trim();
}

// Đổi hướng nhân vật khi chạm cạnh (dùng cho shark, turtle, schools)
function moveCharacter(id, speedX, speedY, flipDefault = 1){
    const el = document.getElementById(id);
    if (!el) return;
    el.style.animation = "none";
    el.style.position = "absolute";

    initFlipOnImage(el, flipDefault);

    let x = (typeof el.offsetLeft === "number" ? el.offsetLeft : parseFloat(getComputedStyle(el).left));
    if (!Number.isFinite(x)) x = 100;
    let y = (typeof el.offsetTop === "number" ? el.offsetTop : parseFloat(getComputedStyle(el).top));
    if (!Number.isFinite(y)) y = 300;
    let dirX = 1, dirY = 1;

    setFlipOnImage(el, 1);

    function animate(){
        x += speedX * dirX;
        y += speedY * dirY;

        const maxX = window.innerWidth - el.offsetWidth;
        const maxY = window.innerHeight - el.offsetHeight;

        if(x <= 0){
            x = 0;
            dirX = 1;
            setFlipOnImage(el, 1);
        } else if(x >= maxX){
            x = maxX;
            dirX = -1;
            setFlipOnImage(el, -1);
        }

        if(y <= 0){
            y = 0;
            dirY = 1;
        } else if(y >= maxY){
            y = maxY;
            dirY = -1;
        }

        el.style.left = x + "px";
        el.style.top = y + "px";

        requestAnimationFrame(animate);
    }
    animate();
}

// Hàm di chuyển đường chéo cho diver (sử dụng hệ flip an toàn đã có)
function moveDiverDiagonal(id, speed = 1.5, angleDeg = 45, flipDefault = 1){
    const el = document.getElementById(id);
    if (!el) return;
    el.style.animation = "none";
    el.style.position = "absolute";

    initFlipOnImage(el, flipDefault);

    const rect = el.getBoundingClientRect();
    let x = Number.isFinite(rect.left) ? rect.left : Math.random()*(window.innerWidth - (el.offsetWidth||50));
    let y = Number.isFinite(rect.top) ? rect.top : Math.random()*(window.innerHeight - (el.offsetHeight||50));

    const angle = angleDeg * Math.PI / 180;
    let vx = Math.cos(angle) * speed;
    let vy = Math.sin(angle) * speed;

    setFlipOnImage(el, vx >= 0 ? 1 : -1);

    function loop(){
        x += vx;
        y += vy;

        const maxX = window.innerWidth - el.offsetWidth;
        const maxY = window.innerHeight - el.offsetHeight;

        if(x <= 0){
            x = 0;
            vx = Math.abs(vx);
            setFlipOnImage(el, 1);
        } else if(x >= maxX){
            x = maxX;
            vx = -Math.abs(vx);
            setFlipOnImage(el, -1);
        }

        if(y <= 0){
            y = 0;
            vy = Math.abs(vy);
        } else if(y >= maxY){
            y = maxY;
            vy = -Math.abs(vy);
        }

        el.style.left = x + "px";
        el.style.top = y + "px";

        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
}

// Bật di chuyển cho divers
moveDiverDiagonal("diver1", 1.2, 45, -1);
moveDiverDiagonal("diver2", 1.2, 135, 1);
moveDiverDiagonal("diver3", 1.0, 60, 1);

// Áp dụng cho các nhân vật khác (khởi động)
moveCharacter("shark", 2, 1);
moveCharacter("turtle", 1, 0.5);
moveCharacter("faintSchool", 1.5, 0.3);
moveCharacter("goldFishSchool", 2, 0.4);