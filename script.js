const exercises = [
  {
    name: "Crunches",
    key: "crunches",
    time: 40,
    target: "Upper abs",
    video: "",
    search: "crunch exercise",
    how: "Lie on your back with knees bent. Lift your shoulders using your abs, squeeze, then lower slowly. Do not pull your neck."
  },
  {
    name: "Plank",
    key: "plank",
    time: 45,
    target: "Full core",
    video: "",
    search: "plank exercise",
    how: "Place elbows under shoulders. Keep your body straight, abs tight, and hips level."
  },
  {
    name: "Leg Raises",
    key: "leg-raises",
    time: 45,
    target: "Lower abs",
    video: "",
    search: "leg raises workout",
    how: "Lie flat. Raise your legs up, then lower slowly without letting your lower back arch."
  },
  {
    name: "Bicycle Crunches",
    key: "bicycle-crunches",
    time: 40,
    target: "Abs and obliques",
    video: "",
    search: "bicycle crunch exercise",
    how: "Bring one elbow toward the opposite knee, then switch sides smoothly like pedaling."
  },
  {
    name: "Mountain Climbers",
    key: "mountain-climbers",
    time: 45,
    target: "Core and cardio",
    video: "",
    search: "mountain climbers exercise",
    how: "Start in a push-up position. Drive knees toward your chest while keeping hips low."
  },
  {
    name: "Russian Twists",
    key: "russian-twists",
    time: 40,
    target: "Side abs",
    video: "",
    search: "russian twist exercise",
    how: "Sit with knees bent, lean back slightly, and rotate your torso side to side with control."
  },
  {
    name: "Flutter Kicks",
    key: "flutter-kicks",
    time: 40,
    target: "Lower abs",
    video: "",
    search: "flutter kicks exercise",
    how: "Lie flat and kick your legs up and down in small motions while keeping your core tight."
  },
  {
    name: "Hollow Hold",
    key: "hollow-hold",
    time: 35,
    target: "Full core",
    video: "",
    search: "hollow body hold exercise",
    how: "Lift shoulders and legs slightly off the floor. Keep lower back pressed down."
  }
];

const tips = [
  "Eat protein with every meal today.",
  "Drink water before every meal.",
  "Move slow. Control builds abs better than rushing.",
  "Aim for 2,000â2,300 calories today.",
  "Walk after meals if you can.",
  "Sleep helps fat loss and recovery."
];

const START_WEIGHT = 220;
const GOAL_WEIGHT = 180;

let currentWorkout = [];
let currentIndex = 0;
let timer = null;
let seconds = 0;
let totalSeconds = 0;
let paused = false;

if (!localStorage.absStartDate) localStorage.absStartDate = Date.now();
if (!localStorage.currentWeight) localStorage.currentWeight = START_WEIGHT;

const currentDay = Math.min(
  30,
  Math.floor((Date.now() - Number(localStorage.absStartDate)) / 86400000) + 1
);

function $(id){ return document.getElementById(id); }
function doneDays(){ return JSON.parse(localStorage.doneDays || "[]"); }
function saveDone(day){
  const done = doneDays();
  if (!done.includes(day)) done.push(day);
  localStorage.doneDays = JSON.stringify(done);
}

function workoutForDay(day){
  const week = Math.ceil(day / 7);
  const count = week === 1 ? 5 : week === 2 ? 6 : week === 3 ? 7 : 8;
  const start = (day * 2) % exercises.length;
  return Array.from({length: count}, (_, i) => exercises[(start + i) % exercises.length]);
}

function speak(text){
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const msg = new SpeechSynthesisUtterance(text);
  msg.rate = 1;
  speechSynthesis.speak(msg);
}

function showScreen(name){
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  $(name).classList.add("active");
  document.querySelectorAll(".nav button").forEach(b => b.classList.toggle("active", b.dataset.screen === name));
  if (name === "home") renderHome();
  if (name === "plan") renderPlan();
  if (name === "progress") renderProgress();
  if (name === "library") renderLibrary();
}

function renderHome(){
  const workout = workoutForDay(currentDay);
  const done = doneDays();
  const currentWeight = Number(localStorage.currentWeight || START_WEIGHT);
  $("dayNumber").textContent = currentDay;
  $("homeStreak").textContent = done.length;
  $("currentWeight").textContent = currentWeight;
  $("remainingWeight").textContent = Math.max(0, currentWeight - GOAL_WEIGHT);
  $("workoutLength").textContent = Math.ceil(workout.reduce((a,e)=>a+e.time,0)/60) + " min";
  $("dailyTip").textContent = tips[currentDay % tips.length];

  $("todayList").innerHTML = workout.map((e,i)=>`
    <div class="item" onclick="openExercise(${i})">
      <span class="demo">â¶</span>
      <div>
        <b>${i+1}. ${e.name}</b>
        <p>${e.time} sec â¢ ${e.target}</p>
      </div>
    </div>
  `).join("");
}

function renderPlan(){
  const done = doneDays();
  $("planList").innerHTML = Array.from({length:30}, (_,i)=>{
    const day = i + 1;
    const w = workoutForDay(day);
    const min = Math.ceil(w.reduce((a,e)=>a+e.time,0)/60);
    const status = done.includes(day) ? "â Completed" : day === currentDay ? "ð¥ Today" : day < currentDay ? "Missed" : "Locked";
    return `
      <div class="item">
        <span>${done.includes(day) ? "â" : day === currentDay ? "ð¥" : "ðï¸"}</span>
        <div><b>Day ${day}</b><p>${min} min â¢ ${w.length} moves â¢ ${status}</p></div>
      </div>
    `;
  }).join("");
}

function renderProgress(){
  const done = doneDays();
  const percent = Math.round(done.length / 30 * 100);
  $("statStreak").textContent = done.length;
  $("statDone").textContent = done.length;
  $("statMinutes").textContent = done.length * 8;
  $("percentDone").textContent = percent + "%";
  $("progressFill").style.width = percent + "%";
  $("calendar").innerHTML = Array.from({length:30}, (_,i)=>{
    const d = i + 1;
    return `<div class="day ${done.includes(d) ? "done" : ""} ${d === currentDay ? "today" : ""}">${d}</div>`;
  }).join("");
}

function renderLibrary(){
  $("libraryList").innerHTML = exercises.map((e,i)=>`
    <div class="item" onclick="openLibraryExercise(${i})">
      <span>â¶</span>
      <div>
        <b>${e.name}</b>
        <p>${e.target} â¢ Search: ${e.search}</p>
      </div>
    </div>
  `).join("");
}

function startWorkout(){
  currentWorkout = workoutForDay(currentDay);
  currentIndex = 0;
  openPlayer();
}

function openExercise(index){
  currentWorkout = workoutForDay(currentDay);
  currentIndex = index;
  openPlayer();
}

function openLibraryExercise(index){
  currentWorkout = [exercises[index]];
  currentIndex = 0;
  openPlayer();
}

function openPlayer(){
  $("player").classList.remove("hidden");
  loadExercise();
}

function closePlayer(){
  clearInterval(timer);
  $("player").classList.add("hidden");
}

function loadExercise(){
  clearInterval(timer);
  paused = false;
  $("pauseBtn").textContent = "Pause";

  const e = currentWorkout[currentIndex];
  seconds = e.time;
  totalSeconds = e.time;

  $("playerCount").textContent = `${currentIndex + 1}/${currentWorkout.length}`;
  $("exerciseName").textContent = e.name;
  $("exerciseHow").textContent = e.how;
  $("timerText").textContent = seconds;

  const video = $("exerciseVideo");
  const fallback = $("videoFallback");

  if (e.video && e.video.trim() !== "") {
    video.src = e.video;
    video.style.display = "block";
    fallback.style.display = "none";
    video.play().catch(()=>{});
  } else {
    video.removeAttribute("src");
    video.style.display = "none";
    fallback.style.display = "flex";
  }

  updateRing();
  speak(e.name);

  timer = setInterval(()=>{
    if (paused) return;
    seconds--;
    $("timerText").textContent = seconds;
    updateRing();

    if (seconds === 10) speak("10 seconds");
    if (seconds === 3) speak("3");
    if (seconds === 2) speak("2");
    if (seconds === 1) speak("1");

    if (seconds <= 0) nextExercise();
  },1000);
}

function updateRing(){
  const angle = (seconds / totalSeconds) * 360;
  $("timerRing").style.setProperty("--angle", angle + "deg");
}

function nextExercise(){
  clearInterval(timer);
  if (currentIndex < currentWorkout.length - 1) {
    currentIndex++;
    speak("Next exercise");
    setTimeout(loadExercise, 500);
  } else {
    finishWorkout();
  }
}

function prevExercise(){
  if (currentIndex > 0) {
    currentIndex--;
    loadExercise();
  }
}

function pauseResume(){
  paused = !paused;
  $("pauseBtn").textContent = paused ? "Resume" : "Pause";
  speak(paused ? "Paused" : "Resume");
}

function finishWorkout(){
  saveDone(currentDay);
  speak("Workout complete");
  closePlayer();
  showScreen("progress");
}

function saveWeight(){
  const val = Number($("weightInput").value);
  if (!val || val < 80 || val > 400) return alert("Enter a real weight.");
  localStorage.currentWeight = val;
  $("weightInput").value = "";
  renderHome();
  renderProgress();
  alert("Weight saved.");
}

document.querySelectorAll(".nav button").forEach(btn=>{
  btn.addEventListener("click",()=>showScreen(btn.dataset.screen));
});

$("startBtn").addEventListener("click", startWorkout);
$("closePlayer").addEventListener("click", closePlayer);
$("nextBtn").addEventListener("click", nextExercise);
$("prevBtn").addEventListener("click", prevExercise);
$("pauseBtn").addEventListener("click", pauseResume);
$("finishBtn").addEventListener("click", finishWorkout);
$("saveWeightBtn").addEventListener("click", saveWeight);

renderHome();
