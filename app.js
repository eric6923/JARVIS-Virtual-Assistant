// 15-04-2024 code

// Define your OpenAI API key
const OPENAI_API_KEY = 'OPEN_API_KEY';
   
//-------------------------------------------------------------------------------------


// Function to send a message to the OpenAI chat completion endpoint
async function sendMessageToOpenAI(message) {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are Jarvis virtual assistant' },
                    { role: 'user', content: message }
                ]
            })
        });

        const data = await response.json();
        if (response.ok) {
            return data.choices[0].message.content;
        } else {
            throw new Error(data.error.message || 'Failed to get response from OpenAI');
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
const btn = document.querySelector(".talk");
const content = document.querySelector(".content");

let isListening = false;
let isCalculatorOpen = false;
let shoppingList = [];
let voices = [];

window.speechSynthesis.onvoiceschanged = function () {
  console.log(window.speechSynthesis.getVoices());
};

function speak(text) {
  const text_speak = new SpeechSynthesisUtterance(text);
  const allvoices = window.speechSynthesis.getVoices();
  text_speak.voice = allvoices.find(
    (voice) => voice.name === "Microsoft Mark - English (United States)"
  );
  text_speak.rate = 1;
  text_speak.volume = 1;
  text_speak.pitch = 1;

  window.speechSynthesis.speak(text_speak);
}
function wishMe() {
  const hour = new Date().getHours();

  if (hour >= 0 && hour < 12) {
    speak("Good Morning Sir...how may I help you");
  } else if (hour >= 12 && hour < 17) {
    speak("Good Afternoon Sir...how may I help you");
  } else {
    speak("Good Evening Sir...how may I help you");
  }
}
window.onload = function () {
  speak("i have indeed been uploaded sir, we are online and ready");
};
function startListening() {
  recognition.start();
  isListening = true;
}
function stopListening() {
  recognition.stop();
  isListening = false;
}
function setTimer(duration, message) {
  setTimeout(() => {
    speak(`Timer for ${message} has finished.`);
  }, duration);
}
function parseTime(input) {
  const parts = input.split(" ");
  const timeIndex = parts.findIndex(
    (part) =>
      !isNaN(parseInt(part)) ||
      part.includes("min") ||
      part.includes("minute") ||
      part.includes("hour") ||
      part.includes("second") ||
      part.includes("sec")
  );
  if (timeIndex !== -1) {
    let duration;
    let unit;
    // Check if the part includes a number and a unit together (like '10 min')
    const match = parts[timeIndex].match(
      /(\d+)\s*(min|minute|hour|second|sec)/
    );
    if (match) {
      // If it does, separate them
      duration = parseInt(match[1]);
      unit = match[2];
    } else {
      // Otherwise, assume the previous part is the number and this part is the unit
      duration = parseInt(parts[timeIndex]);
      unit = parts[timeIndex + 1];
    }
    switch (unit) {
      case "min":
      case "minute":
        return duration * 60000; // Convert minutes to milliseconds
      case "hour":
        return duration * 3600000; // Convert hours to milliseconds
      case "sec":
      case "second":
        return duration * 1000; // Convert seconds to milliseconds
      default:
        return null;
    }
  } else {
    return null;
  }
}

// shopping list functions

function saveData(item) {
  const bucket = item.split(" ");
  for (let i = 0; i < bucket.length; i++) {
    const newData = {
      x: bucket[i],
    };

    // Check if there's existing data in localStorage
    let existingDataJson = localStorage.getItem("myData");

    let existingData = existingDataJson ? JSON.parse(existingDataJson) : [];

    if (!Array.isArray(existingData)) {
      existingData = [];
    }

    for (let i = 1; i < bucket.length; i++) {
      console.log(bucket[i]);
    }
    existingData.push(newData);

    // Convert data to JSON format
    const jsonData = JSON.stringify(existingData);

    localStorage.setItem("myData", jsonData);
  }
  speak(item + "has been added sir");

  console.log("Data saved to localStorage.");
}

function removeData(name) {
  // Load data from localStorage
  const jsonData = localStorage.getItem("myData");

  if (jsonData) {
    let data = JSON.parse(jsonData);

    // Find index of item with specified name
    const indexToRemove = data.findIndex((item) => item.x === name);

    if (indexToRemove !== -1) {
      data.splice(indexToRemove, 1);

      // Convert data to JSON format
      const updatedDataJson = JSON.stringify(data);

      localStorage.setItem("myData", updatedDataJson);

      console.log("Data removed from localStorage.");

      speak(name + "has been removed sir");
    } else {
      speak("sir the item you are trying to remove is not in the list");

      console.log("Item not found in data.");
    }
  } else {
    console.log("No data found in localStorage to remove.");
  }
}

function loadData() {
  const jsonData = localStorage.getItem("myData");

  if (jsonData) {
    // Parse JSON data
    const data = JSON.parse(jsonData);

    speak("sir there's ");
    data.forEach((item) => {
      speak(item.x);
      console.log(item.x);
    });
  } else {
    speak("sir your shopping list is currently empty");
    console.log("No data found in localStorage.");
  }
}

function clearData() {
  if (localStorage.getItem("myData") === null) {
    speak("sir your shopping list is already empty");

    console.log("No data found in localStorage.");
  } else {
    localStorage.clear();

    speak("sir your shopping list has been emptied");
    console.log("Data cleared from localStorage.");
  }
}

async function takeCommand(message) {
  if (message.includes("sleep")) {
    isListening = false;
    speak("stopping services");
    exit();
  } else if (
    (isListening == true && message.includes("jarvis"))
  ) {
    speak("stand by and biometric scan ready");
    const video = document.getElementById("video");
    let intervalId;

    Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri('/model'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/model'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/model'),
    ]).then(startWebcam).then(faceRecognition);

    function startWebcam() {
        navigator.mediaDevices.getUserMedia({
            "video": true,
            audio: false
        }).then((stream) => {
            video.srcObject = stream;
        }).catch((error) => {
            console.error(error);
        });
    }

    function getLabeledFaceDescriptions() {
        const labels = ["Aswin", "Eric"];
        return Promise.all(
            labels.map(async (label) => {
                const descriptions = [];
                for (let i = 1; i <= 2; i++) {
                    const image = await faceapi.fetchImage(`./labels/${label}/${i}.png`);
                    const detections = await faceapi
                        .detectSingleFace(image)
                        .withFaceLandmarks()
                        .withFaceDescriptor();
                    descriptions.push(detections.descriptor);
                }
                return new faceapi.LabeledFaceDescriptors(label, descriptions);
            })
        );
    }
    isFaceRecognized = false;
    async function faceRecognition() {
        const LabeledFaceDescriptors = await getLabeledFaceDescriptions();
        const faceMatcher = new faceapi.FaceMatcher(LabeledFaceDescriptors);

        const container = document.getElementById("container");
        const canvas = faceapi.createCanvasFromMedia(video);
        container.append(canvas);

        const displaySize = {
            width: 300,
            height: 220
        };
        faceapi.matchDimensions(canvas, displaySize);

        intervalId = setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();
            console.log(detections.length);
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            const results = resizedDetections.map((d) => {
                return faceMatcher.findBestMatch(d.descriptor);
            });

            results.forEach((result, i) => {
                const box = resizedDetections[i].detection.box;
                const drawBox = new faceapi.draw.DrawBox(box, {
                    label: result.toString()
                });
                drawBox.draw(canvas);
            
                if ((result.label === "Aswin" || result.label === "Eric") && !isFaceRecognized) {
                    speak("Welcome back sir, we are online and ready");
                    isFaceRecognized = true; 
                    clearInterval(intervalId);  
                    
                    let tracks = video.srcObject.getTracks();
                    tracks.forEach(track => track.stop());
                    video.srcObject = null;
                    canvas.remove();
                }
            });

    }, 100);

    // Listen for the pause event to stop the interval
    video.addEventListener('pause', onPause);

    function onPause() {
        clearInterval(intervalId);
        video.removeEventListener('pause', onPause); // Remove the event listener
    }
    } 
  } else if (isListening == true && message.includes("open google")) {
    window.open("https://google.com", "_blank");
    speak("Opening Google...");
  } else if (isListening == true && message.includes("open youtube")) {
    window.open("https://youtube.com", "_blank");
    speak("Opening Youtube...");
  } else if (isListening == true && message.includes("open facebook")) {
    window.open("https://facebook.com", "_blank");
    speak("Opening Facebook...");
  } else if (isListening == true && message.includes("open wikipedia")) {
    window.open(
      `https://en.wikipedia.org/wiki/${message.replace("wikipedia", "")}`,
      "_blank"
    );
    speak("This is what I found on Wikipedia regarding " + message);
  } else if (isListening == true && (message.includes("what") || message.includes("who is") || message.includes("what are") || message.includes("how"))) {
    // Send message to OpenAI for response
    try {
        const response = await sendMessageToOpenAI(message);
        speak(response);
    } catch (error) {
        console.error('Error:', error);
        speak("I'm sorry, I couldn't process your request at the moment.");
      }
    }
  else if (isListening == true && message.includes("date")) {
    const date = new Date().toLocaleString(undefined, {
      month: "short",
      day: "numeric",
    });
    speak(date);
  } else if (isListening == true && message.includes("calculator")) {
    if (!isCalculatorOpen) {
      window.open("Calculator:///");
      speak("Opening Calculator");
      isCalculatorOpen = true;
    }
  }
  if (isListening == true && message.includes("set")) {
    const duration = parseTime(message);
    if (duration !== null) {
      const reminderMessage = message.split("timer for")[1].trim();
      if (reminderMessage) {
        setTimer(duration, reminderMessage);
        speak(`Setting a ${duration / 60000} minutes timer `);
      } else {
        speak("Please provide a message for the timer.");
      }
    }
  }
  if (isListening == true && message.includes("alarm")) {
    let duration = "";
    convertTo24HourFormat(message).length == 5
      ? (duration = convertTo24HourFormat(message))
      : (duration = null);
    console.log(duration);

    if (isListening == true && message.includes("set") && duration !== null) {
      setReminder(duration.toString());
      speak(`Setting an alarm for ${duration}`);
    }

    if (
      isListening == true &&
      message.includes("delete") &&
      message.includes("of")
    ) {
      deleteReminder(duration);
      speak(`Deleting the alarm for ${duration}`);
    }

    if (
      isListening == true &&
      message.includes("all") &&
      message.includes("delete")
    ) {
      deleteAllReminders();
    }

    if (
      isListening == true &&
      message.includes("show") &&
      message.includes("all")
    ) {
      RemindersList();
    }
  } else if (isListening == true && message.includes("add ")) {
    const item = message.split("add ")[1].split(" to my shopping list")[0];
    console.log("Item to add: " + item);

    saveData(item);
  } else if (isListening == true && message.includes("remove ")) {
    const item = message.split("remove ")[1].split(" from my shopping list")[0];
    console.log("Item to remove: " + item);

    removeData(item);
  } else if (
    isListening == true &&
    message.includes("empty") &&
    message.includes("shopping list")
  ) {
    clearData();
  } else if (
    isListening == true &&
    message.includes("what's on my shopping list")
  ) {
    loadData();
  } else if (message.includes("hello, jarvis")) {
    isListening = true;
    wishMe();
  } else if (isListening == true && message.includes("weather")) {
    getUserLocation();
  }
  function getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          fetchWeatherData(latitude, longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          speak(
            "Unable to determine your location. Please manually provide a city or address."
          );
        }
      );
    } else {
      speak("Geolocation is not supported by your browser.");
    }
  }

  function fetchWeatherData(latitude, longitude) {
    const apiKey = "90dd0ca0d342b3d43647934dbd88fd77"; // Your OpenWeatherMap API key
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        // Process weather data and provide information to the user
        const currentTemp = Math.round(data.main.temp - 273.15); // Convert from Kelvin to Celsius
        const currentCondition = data.weather[0].description;
        speak(
          `The current temperature is ${currentTemp} degrees Celsius and the weather is ${currentCondition}.`
        );
      })
      .catch((error) => {
        console.error("Error fetching weather data:", error);
        speak("There was an error retrieving weather information.");
      });
  }
}
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.onresult = (event) => {
  const currentIndex = event.resultIndex;
  const transcript = event.results[currentIndex][0].transcript;
  content.textContent = transcript;
  takeCommand(transcript.toLowerCase());
};
recognition.onend = () => {
  if (isListening) {
    recognition.start();
  }
};
btn.addEventListener("click", () => {
  content.textContent = "Listening....";
  startListening();
});

// alarm function

function setReminder(time) {
  const reminderTimeInput = time;

  // Load existing reminders from local storage
  let reminders = JSON.parse(localStorage.getItem("reminders")) || [];

  reminders.push(reminderTimeInput);

  // Save the updated reminders array to local storage
  localStorage.setItem("reminders", JSON.stringify(reminders));

  displayReminders();

  scheduleReminder(reminderTimeInput);

  console.log(reminderTimeInput);
}

function scheduleReminder(reminderTime) {
  const reminderDate = new Date();
  const [hours, minutes] = reminderTime.split(":");
  reminderDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  // Calculate the delay until the reminder time
  const delayMillis = reminderDate.getTime() - Date.now();

  setTimeout(function () {
    alert("Reminder: It's time!");
    deleteReminder(reminderTime);
  }, delayMillis);
}

function deleteReminder(time) {
  let reminders = JSON.parse(localStorage.getItem("reminders")) || [];

  // Find the index of the reminder with the specified time
  const index = reminders.findIndex((reminder) => reminder === time);

  if (index !== -1) {
    reminders.splice(index, 1);

    // Save the updated reminders array to local storage
    localStorage.setItem("reminders", JSON.stringify(reminders));

    displayReminders();
  } else {
    console.log("Reminder not found");
  }
}

function deleteAllReminders() {
  localStorage.removeItem("reminders");
}

function displayReminders() {
  let reminders = JSON.parse(localStorage.getItem("reminders")) || [];

  reminders.forEach((reminder) => {
    scheduleReminder(reminder);
  });
}

// Function to be executed after the page has loaded
window.onload = function () {
  displayReminders();
};

function RemindersList() {
  let reminders = JSON.parse(localStorage.getItem("reminders")) || [];

  let size = reminders.length;

  speak(`You have ${size} reminders set sir,  `);

  for (let i = 0; i < size - 1; i++) {
    const hour = reminders[i].substring(0, 2);
    const minute = reminders[i].substring(3, 5);
    speak(parseInt(hour) - 12 + ":" + minute);
  }

  const hour = reminders[size - 1].substring(0, 2);
  const minute = reminders[size - 1].substring(3, 5);
  if (size != 1) speak("and");
  speak(parseInt(hour) - 12 + ":" + minute);
}

function convertTo24HourFormat(input) {
  // Extract the time part from the input using a regular expression
  const match = input.match(/(\d{1,2}:\d{2})\s*([ap]\.m\.)/i);
  if (!match) {
    return "Invalid input format";
  }

  const time = match[1];
  const period = match[2];

  let [hours, minutes] = time.split(":");
  hours = parseInt(hours);
  minutes = parseInt(minutes);

  if (period.toLowerCase() === "p.m." && hours !== 12) {
    hours += 12;
  } else if (period.toLowerCase() === "a.m." && hours === 12) {
    hours = 0;
  }

  // Format the time as HH:MM
  const formattedTime =
    String(hours).padStart(2, "0") + ":" + String(minutes).padStart(2, "0");

  return formattedTime;
}
