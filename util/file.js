const fs = require('fs');

const deteteFile = (finePath) => {
    fs.unlink(finePath, (err) => {
        if(err){
            throw (err);
        }
    })
}

exports.deteteFile = deteteFile;