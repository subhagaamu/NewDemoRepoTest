var express = require('express');
var cors = require("cors");
var bodyparser = require('body-parser')
var path = require('path');
var fs = require('fs')
const PORT = "8000"
const app = express();

app.use(cors());
app.use(bodyparser())
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.options('*', cors());
app.use(express.json());

app.post('/writeToJsonFile', (request, response) => {
    var data = JSON.stringify(request.body.finalData)
    let fileName = request.body.fileName;
    fs.writeFile(fileName + "." + "json", data, (res, err) => {
        if (err) {
            console.log("file not created", err)
        }
        else {
            console.log("file created", res)
            fs.readFile(fileName + "." + "json", (res) => {
                response.send(data)
            })
        }
    })
})
app.post('/writeToJsonFileSubmit', (request, response) => {
    var data = JSON.stringify(request.body.jsonFiledata)
    let fileName = request.body.fileName;
    fs.writeFile(fileName + "." + "json", data, (res, err) => {
        if (err) {
            console.log("file not created", err)
        }
        fs.readFile(fileName + "." + "json", (err, res) => {
        if (err) {
            console.log("file doesn't read", err)
        }
        console.log("file  read")
        response.send(res)
    })
    })
})
app.post('/readJsonFile', (request, response) => {
    let fileName = request.body.fileName;
    fs.readFile(fileName + "." + "json", (err, res) => {
        if (err) {
            console.log("file doesn't read", err)
        }
        console.log("file  read")
        response.send(res)
    })

})
app.post('/checkExcelFile', (request, response) => {
    console.log("inside server")
    var fileName = request.body.file.fileName;
    console.log(fileName)
    if (fileName) {
        const filePath = path.join(__dirname, '/../../' + '/Downloads' + '/' + fileName + ".xlsx");
        console.log(filePath);
        fs.exists(filePath, (res, err) => {
            if (err) {
                console.log("file not checked", err)
            }
            console.log("file checked", res)
            response.send(res)
        })

    }

})

app.post('/deleteExistFile', (request, response) => {
    console.log(request.body)
    var fileName = request.body.fileName;
    console.log(fileName)
    const filePath = path.join(__dirname, '/../../' + '/Downloads' + '/' + fileName + ".xlsx");
    fs.unlink(filePath, (err, res) => {
        if (err) throw err;
        // console.log('successfully deleted /tmp/hello');
        console.log("file deleted", res)
        response.send(res)

    });
})
app.post('/checkFileExists', (request, response) => {
    var fileName = request.body.fileName;
    if (fileName) {
        fs.exists("./" + fileName + "." + "json", (res, err) => {
            if (err) {
                console.log("file not checked", err)
            }
            console.log("file checked", res)
            response.send(res)
        })

    }
    // response.send()
})

app.listen(PORT, () => {
    console.log("App running on the port number" + PORT)
})