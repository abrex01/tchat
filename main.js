const readline = require("readline");
const options = require("./options.json");
var rl = readline.createInterface(process.stdin, process.stdout);
var ready = false;
var status = 1;
var callBack = () => {
    isConnected = true;
    console.log(pre + " Logged in as " + clc.green(user.username));
    console.log(pre + " Type something and hit [ENTER] to send message ");
    user.channel = "global";
    socket.emit("join-request", "global");
    socket.on("amessage", msg => {
        if (status == 1) {display(msg)};
    })
    socket.on("join", uname => {
        if (status == 1) {display({
            author: "SYSTEM",
            content: `${clc.bold.yellow(uname)} joined`,
            systemMessage: true
        })}
    })
    socket.on("join-request-refuse", () => {
        if (status == 1) {display({
            author: "SYSTEM",
            content: `Room you tried to join, does not exist`,
            systemMessage: true
        })}
    })
    socket.on("users-display-response", arr => {
        if (status == 1) {display({
            author: "SYSTEM",
            content: `Users here: ${arr}`,
        })}
    })
    socket.on("join-request-accept", roomName => {
        user.channel = roomName
        logRoomHeader(roomName)
    })
    socket.on("disconnect", () => {
        isConnected = false
    })
    socket.on("leave", (uname) => {
        if (status == 1) {display({
            author: "SYSTEM",
            content: `${uname} left`,
            systemMessage: true
        })}
    })
    loopMinput()
}
var lstatus = ""
const {on, EventEmitter} = require("events");
const emitter = new EventEmitter();
const clc = require('cli-color');
const fs = require("fs");
const { io } = require("socket.io-client");
const url = "https://tchat.abyoux.repl.co/" 
const socket = io(url)
console.clear()
process.title = options["console-title"]
var isConnected;
fs.readFile(__dirname + options["welcoming-text-file-name"], "utf-8", (err, data) => {
    process.stdout.write(clc.red.bold(data) + "\n\n")
    var title = options["console-title"]
    let i = 0
    setInterval(() => {
        if (i == title.length) {
            clearInterval(this)
        }
        process.stdout.write(clc.green(title.charAt(i)))
        i++
    }, 200)
})
function logRoomHeader(room) {
    let rn = `{${room}}`
    let nos = ((process.stdout.columns - rn.length) / 2) - 2
    let set = ""
    for (var i = 0; i < nos; i++) {
        set += clc.red(" ")
    }
    console.clear()
    console.log(set + clc.bold.redBright.underline(rn.toUpperCase()))
}
const lb = "\n"
function loopMinput() {
    process.stdout.write(`${user.username}:`)
    rl.on("line", (message) => {
        if (message.split(" ")[0] == "t!exit") {
            process.exit(1)
        } else if(message.split(" ")[0] == "t!users") {
            socket.emit("users-display-request")
        } else if(message.split(" ")[0] == "t!cd") {
            socket.emit("join-request", message.split(" ")[1])
        } else if(message.split(" ")[0] == "t!resume"){
            status = 1
        } else if(message.split(" ")[0] == "t!pause"){
            status = 0
        } else {
            let msg = {
                author: user.username,
                content: message,
                date: (new Date()).toUTCString()}
        if (isConnected && status == 1) {
            socket.emit("message", msg);
        } else {
            console.log("\n You are disconnected or app is paused. \n")}
        }
    })

}
const pre = clc.red("[!]")
var user = {};

function display(msg) {
    if (!msg.systemMessage){
        console.log(`${lb} ${clc.bold.yellow(msg.author)}: \'${msg.content}\' ${lb} ${lb}`)
    } else {
        console.log((`${lb} ${clc.bold(pre)} ${msg.content} ${lb}`))
    }
}

function loginLoop() {
    socket.removeAllListeners()
    console.clear()
    console.log(lstatus + "\n")
    rl.question(clc.red("   Your username: \n "), (uname) => {
        user.username = uname
        rl.question(clc.red("   Your password: \n "), (pw) => {
            user.password = pw
            socket.emit("login", user);
        socket.on("login-granted", callBack)
        socket.on("login-denied", () => {
            isConnected = false
            lstatus = `${clc.bgRed.bold("Username or Password is NOT correct")}\n- Be sure you have registered this account at https://tchat.abyoux.repl.co/register`
            socket.disconnect()
            socket.connect()
            loginLoop()
        })
      })
    })
}
setTimeout(loginLoop, 5000)
