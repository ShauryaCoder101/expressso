const express = require("express")
const app = express()
const logEvents =require('./logEvents');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const http = require('http');
const hbs=require ("hbs");
const collection =require('./mongodb');

app.use(express.json())
app.set("view engine","hbs")
app.use(express.urlencoded({extended:false}))

const EventEmitter = require('events');

class MyEmitter extends EventEmitter {};

const myEmitter = new MyEmitter();
myEmitter.on('log', (msg, fileName) => logEvents(msg, fileName));

const PORT = process.env.PORT || 3000;

const serveFile = async (filePath, contentType, response) => {
    try {
        const rawData = await fsPromises.readFile(
            filePath,
            !contentType.includes('image') ? 'utf8' : ''
        );
        const data = contentType === 'application/json'
            ? JSON.parse(rawData) : rawData;
        response.writeHead(
            filePath.includes('404.html') ? 404 : 200,
            { 'Content-Type': contentType }
        );
        response.end(
            contentType === 'application/json' ? JSON.stringify(data) : data
        );
    } catch (err) {
        console.log(err);
        myEmitter.emit('log', `${err.name}: ${err.message}`, 'errLog.txt');
        response.statusCode = 500;
        response.end();
    }
}

const  server = http.createServer((req,res)=>{
    console.log(req.url, req.method);
    myEmitter.emit('log', `${req.url}\t${req.method}`, 'reqLog.txt');

const extension = path.extname(req.url);

    let contentType;

    switch (extension) {
        case '.css':
            contentType = 'text/css';
            break;
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.jpg':
            contentType = 'image/jpeg';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.txt':
            contentType = 'text/plain';
            break;
        default:
            contentType = 'text/html';
    }

    let filePath = path.join(__dirname, 'frontend', req.url === '/' ? 'expmain.html' : req.url);

    // makes .html extension not required in the browser
    if (!extension && req.url.slice(-1) !== '/') filePath += '.html';

    const fileExists = fs.existsSync(filePath);

    if (fileExists) {
        serveFile(filePath, contentType, res);
    } else {
        switch (path.parse(filePath).base) {
            case 'old-page.html':
                res.writeHead(301, { 'Location': '/expmain.html' });
                res.end();
                break;
            case 'www-page.html':
                res.writeHead(301, { 'Location': '/' });
                res.end();
                break;
           
        }
    }
});
app.get("/login.hbs",(req,res)=>{
    res.render("login")
})
app.get("/signup.hbs", (req,res)=>{
    res.render("signup")
})

app.post("/signup",async (req,res)=>{
    const data={
        username:req.body.username,
        password:req.body.password
    }
    try {
        // Use create to insert a single document
        await collection.insertMany([data]);
        // Redirect to page2.hbs after successful signup
        res.render("page2.hbs");
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).send("Internal server error"); // Handle unexpected errors
    }
    
});


app.post("/login",async (req,res)=>{
    try {
        // Find the user by username
        const user = await collection.findOne({ username: req.body.username });

        // Check if the user exists
        if (!user) {
            console.log(req.body.username);
            return res.send("wrong username"); 
        }

        
        const { username, password } = user; 
        if (password1 !== req.body.password) {
            return res.send("wrong password"); 
        }
        return res.render("page2.hbs");
    }catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).send("Internal server error"); // Handle unexpected errors
    }
})

server.listen(PORT,()=>console.log(`port= ${PORT}`))
