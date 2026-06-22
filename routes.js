    
    const fs = require('fs');

    const requestHandler = (req,res) => {

    
    const url = req.url;
    const method = req.method;
    if(url === '/')
    {
        res.write('<html>');
        res.write('<head><title>Hello</title>');
        res.write('</head>');
        res.write('<body><form method="POST" action="/message"><input type="text" name="message"><button type="submit">Submit</button></form></body>');
        res.write('</html>');
        res.end();
        return res;
    }
    if(url == '/message' && method == 'POST'){
        const body = [];
        req.on('data',(chunk) => {
            console.log(chunk);
            body.push(chunk);
            console.log(body);
        });
        return req.on('end',() => {
            const parsebody = Buffer.concat(body).toString();
            const message = parsebody.split('=')[0];
            console.log(message);
            fs.writeFile('message',message,err => {
                res.statusCode = 302;
                res.setHeader('Location','/');
                return res.end();

            });
        })
    }
    res.setHeader('Content-Type','text/html');
    res.write('<html>');
    res.write('<head><title>Hello Js</title></head>');
    res.write('<body>I am using js</body>')
    res.end();
    }

    module.exports = requestHandler;