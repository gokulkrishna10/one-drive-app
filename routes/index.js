<<<<<<< HEAD
const controller = require('../controllers/oneDriveController');

exports.listFiles = async function (req, res) {
    try {
        const files = await controller.listFiles(req)
        res.status(200).json(files)
    } catch (error) {
        res.status(500).send('Error listing files')
    }
}

exports.redirect = async function (req, res) {
    try {
        const files = await controller.redirect(req)
        res.status(200).json(files)
    } catch (error) {
        res.status(500).send('Error listing files')
    }
}


exports.testServer = function (req, res) {
    try {
        res.status(200).send("server is running........")
    } catch (error) {
        res.status(500).send("server failed........")
    }
}



=======

exports.runServer = function (req, res) {
    res.status(200).send("server is running........")
}
>>>>>>> 719fab7fb45fb36d494d032a08d58390c7beddea
