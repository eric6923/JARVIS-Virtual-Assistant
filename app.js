// 09-03-2024 code
const btn = document.querySelector('.talk');
const content = document.querySelector('.content');

let isListening = false;
let isCalculatorOpen = false;
let shoppingList = [];

function speak(text) {
    const text_speak = new SpeechSynthesisUtterance(text);

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
    const parts = input.split(' ');
    const timeIndex = parts.findIndex(part => !isNaN(parseInt(part)) || (part.includes('min') || part.includes('minute') || part.includes('hour') || part.includes('second') || part.includes('sec')));
    if (timeIndex !== -1) {
        let duration;
        let unit;
        // Check if the part includes a number and a unit together (like '10 min')
        const match = parts[timeIndex].match(/(\d+)\s*(min|minute|hour|second|sec)/);
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
            case 'min':
            case 'minute':
                return duration * 60000; // Convert minutes to milliseconds
            case 'hour':
                return duration * 3600000; // Convert hours to milliseconds
            case 'sec':
            case 'second':
                return duration * 1000; // Convert seconds to milliseconds
            default:
                return null;
        }
    } else {
        return null;
    }
}
function additem(item){
    shoppingList.push(item);
    console.log("Added item: " + item);
    speak(item + "has been added sir");
}
function viewList(){
    if(shoppingList.length === 0){
        speak("sir your shopping list is currently empty");
    }
    else{
        speak("sir there's ");
        for(let i=0;i<shoppingList.length;i++){
            speak("- "+shoppingList[i]);
        }
    }
}
function takeCommand(message) {
    if (message.includes('jarvis')) {
        isListening = true;
        wishMe();
    } else if (message.includes('sleep, jarvis.')) {
        isListening = false;
        speak('stopping services');
    } else if ((isListening == true && message.includes('jarvis, you up?')) || message.includes('nope')) {
        speak("For you sir, always");
    } else if (isListening == true && message.includes("open google")) {
        window.open("https://google.com", "_blank");
        speak("Opening Google...");
    } else if (isListening == true && message.includes("open youtube")) {
        window.open("https://youtube.com", "_blank");
        speak("Opening Youtube...");
    } else if (isListening == true && message.includes("open facebook")) {
        window.open("https://facebook.com", "_blank");
        speak("Opening Facebook...");
    } else if (isListening == true && (message.includes('what is') || message.includes('who is') || message.includes('what are'))) {
        window.open(`https://www.google.com/search?q=${message.replace(/\s+/g, '+')}`, "_blank");
        let trimmedMessage = message.replace('what is ', '').replace('who is ', '').replace('what are ', '');
        speak("This is what I found on the internet regarding " + trimmedMessage);
    } else if (isListening == true && message.includes('open wikipedia')) {
        window.open(`https://en.wikipedia.org/wiki/${message.replace("wikipedia", "")}`, "_blank");
        speak("This is what I found on Wikipedia regarding " + message);
    } //else if (isListening == true && message.includes('time')) {
        //const time = new Date().toLocaleString(undefined, { hour: "numeric", minute: "numeric" });
       // speak(time);
    //} 
    else if (isListening == true && message.includes('date')) {
        const date = new Date().toLocaleString(undefined, { month: "short", day: "numeric" });
        speak(date);
    } else if (isListening == true && message.includes('calculator')) {
        if (!isCalculatorOpen) {
            window.open('Calculator:///');
            speak("Opening Calculator");
            isCalculatorOpen = true;
        }
    } if (isListening == true && message.includes('set')) {
        const duration = parseTime(message);
        if (duration !== null) {
            const reminderMessage = message.split('timer for')[1].trim();
            if (reminderMessage) {
                setTimer(duration, reminderMessage);
                speak(`Setting a ${duration / 60000} minutes timer for ${reminderMessage}`);
            } else {
                speak('Please provide a message for the timer.');
            }
        }
    }
    else if(isListening == true && message.includes("add ",)){
        const item = message.split("add ")[1].split(" to my shopping list")[0];
        console.log("Item to add: " + item);
        additem(item);
        speak(item+ ' has been added sir');
    }
    else if(isListening == true && message.includes("what's on my shopping list")){
        viewList();
    }
}
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
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
btn.addEventListener('click', () => {
    content.textContent = "Listening....";
    startListening();
});
