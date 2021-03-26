const express = require("express");

const router = express.Router();

const Mpesa = require("../controllers/Mpesa");

router.post('/b2c', 
    (req,res,next) => new Mpesa().getAccessToken(req,res,next),
    (req,res,next) => new Mpesa().b2c(req,res,next)
);

router.post('/c2b',
    (req,res,next) => new Mpesa().getAccessToken(req,res,next),
    (req,res,next) => new Mpesa().c2b(req,res,next)
);

router.post('/register-url',
    (req,res,next) => new Mpesa().getAccessToken(req,res,next),
    (req,res,next) => new Mpesa().registerUrl(req,res,next)
);

router.post('/validation', 
    (req,res,next) => new Mpesa().validation(req,res,next)
);

router.post('/confirmation',
    (req,res,next) => new Mpesa().confirmation(req,res,next)
);3

router.post('/cb', 
    (req,res,next) => new Mpesa().cb(req,res,next)
);

router.post('/timeout',
    (req,res,next) => new Mpesa().timeOut(req,res,next)
);

module.exports = router;