const express = require('express');
const router = express.Router();
const schedule = require('node-schedule');
const fs = require("fs");
const mime = require('mime');
const path = require('path');
const crypto = require('crypto');
const multer  = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            cb(null, raw.toString('hex') + Date.now() + '.' + mime.getExtension(file.mimetype));
        });
    }
});

const upload = multer({ storage: storage });

const Procedure = require('../models/procedure');
const Threshold = require('../models/threshold');
const Client = require('../models/client');

let j = schedule.scheduleJob('* 0 * * *', function(){
    Procedure.findOne({isCurrent: true, expDate: {$ne: null}}, function(err, procedure){
        if(err){
            console.log(err);
            return;
        } else {
            if(procedure != null) {
                if(new Date > procedure.expDate){
                    Procedure.update({_id: procedure._id}, {$set:{isCurrent: false}}, function(err){
                        if(err)
                            console.log(err);
                    });
                }
            }
        }
    });
});

router.get('/proceduresInfo', function(req,res){
    Procedure.find(function(err, procedures){
        if(err) {
            console.log(err);
        } else {
            res.json(procedures);
        }
    })
});

router.get('/procedureInfo/:id', function(req, res) {
    Procedure.findById(req.params.id, function(err, procedure) {
        if(err) {
            console.log(err);
        } else {
            Client.find({idProcedure: procedure._id}, function(err, clients) {
                if (err) {
                    console.error(err);
                } else {
                    res.json({procedure: procedure, clients: clients});
                }
            });
        }
    });
});

router.get('/getCurrentProcedure', function(req,res){
    Procedure.findOne({isCurrent: true}, function(err, procedure){
        if(err) {
            console.log(err);
        } else {
            Client.find({idProcedure: procedure._id}, function(err, clients) {
                let count = 0;
                for(let i = 0; i< clients.length; i++) {
                    count += clients[i].bodyparts.length;
                }
                if(err) {
                    console.error(err);
                } else {
                    Threshold.findOne({idProcedure: procedure._id}).sort({clientCount: 1}).exec(function (err, falseThreshold) {
                        if(err) {
                            console.error(err);
                        } else {
                            console.log(falseThreshold);
                            Threshold.findOne({idProcedure: procedure._id, isCurrent: true}, function(err, threshold) {
                                if(err) {
                                    console.error(err);
                                } else {
                                    res.json({
                                        "procedure": procedure,
                                        "threshold": threshold,
                                        "peopleCount": falseThreshold.clientCount + count
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    })
});

router.get('/clientPhoto/:filename', function(req ,res) {
    res.sendFile( path.resolve("/root/sales/sales-back/uploads/"+req.params.filename));
});

router.get('/procedurePhoto/:filename', function(req ,res) {
    res.sendFile( path.resolve("/root/sales/sales-back/uploads/"+req.params.filename));
});

router.post('/addProcedure', upload.single("inputProcedurePicture"), function(req, res){
    let backURL=req.header('Referer') || '/';
    Procedure.findOne({isCurrent: true}, function(err, procedure){
        if(err){
            console.log(err);
            return;
        } else {
            if(procedure === null) {
                req.checkBody('inputTitle', 'Nazwa zabiegu jest wymagana').notEmpty();
                req.checkBody('inputDesc', 'Opis zabiegu jest wymagany').notEmpty();
                req.checkBody('inputPrice', 'Cena początkowa jest wymagana').notEmpty();
                req.checkBody('discount', 'Wymagany jest przynajmniej jeden próg promocyjny').notEmpty();
                req.checkBody('bodyparts', 'Wymagane jest podanie przynajmniej jednej części ciała').notEmpty();

                let errors = [{value: 0}];
                errors = errors.concat(req.validationErrors());
                if(errors[1]) {
                    res.json(errors);
                } else {
                    for(let i=1; i<req.body.discount.length; i++) {
                        if(Number(req.body.peopleCount[i]) < Number(req.body.peopleCount[i-1]) || Number(req.body.discount[i]) < Number(req.body.discount[i-1])) {
                            console.log(req.body.peopleCount[i] + ' < '  + req.body.peopleCount[i-1]);
                            console.log(typeof req.body.peopleCount[i]);
                            let errors = [];
                            errors.push({value: 0},{msg:'Kolejne progi oraz ich zniżki muszą być wyższe od poprzednich.'});
                            return res.json(errors);
                        }
                    }

                    let procedure = new Procedure();
                    procedure.title = req.body.inputTitle;
                    procedure.description = req.body.inputDesc;
                    procedure.picture = req.file.filename;
                    procedure.startDate = req.body.inputStartDate;
                    procedure.expDate = req.body.inputEndingDate;
                    procedure.startPrice = req.body.inputPrice;
                    procedure.isCurrent = true;
                    procedure.bodyparts =  req.body.bodyparts;
                    
    
                    procedure.save(function(err){
                        if(err){
                            console.log(err);
                            return;
                        } else {
                            Procedure.findOne().sort({_id:-1}).limit(1).exec(function(err, procedure){
                                for(let i=0; i<req.body.discount.length; i++) {
                                    if(i > 0 && (req.body.peopleCount[i] < req.body.peopleCount[i-1] || req.body.discount[i] < req.body.discount[i-1])) {
                                        let errors = [];
                                        errors.push({value: 0},{msg:'Kolejne progi oraz ich zniżki muszą być wyższe od poprzednich.'});
                                        return res.json(errors);
                                    }
                                    let threshold = new Threshold();
                                    threshold.idProcedure = procedure._id;
                                    threshold.clientCount = req.body.peopleCount[i];
                                    threshold.discount = req.body.discount[i];
                                    threshold.price = req.body.inputPrice - req.body.inputPrice * (req.body.discount[i] / 100);
                                    threshold.isFulfiled = false;
                                    threshold.isCurrent = false;
                                    if(i === 0) {
                                        threshold.isFulfiled = true;
                                        threshold.isCurrent = true;
                                    }
            
                                    threshold.save(function(err){
                                        if(err){
                                            console.log(err);
                                            return;
                                        } else {
                                            //res.redirect(backURL);
                                            //let success = [{value: 1},{msg: 'Dodano nowy zabieg'}];
                                            //res.json(success);
                                        }
                                    });
                                }
                                let success = [{value: 1},{msg: 'Dodano nowy zabieg'}];
                                res.json(success);
                            });
                        }
                    });
                }
            } else {
                let errors = [];
                errors.push({value: 0},{msg:'Istnieje aktywny zabieg.'});
                res.json(errors);
                //res.redirect(backURL);
            }
        }
    });
});

router.post('/stopProcedure/:id', function(req, res) {
    let backURL=req.header('Referer') || '/';
    Procedure.findByIdAndUpdate(req.params.id, {$set: {isCurrent: false}}, function(err, procedure){
        if(err) {
            console.error(err)
        } else {
            res.redirect(backURL);
        }
    });
});

router.post('/addClient/:id', upload.single("inputPicture"), function(req, res) {

    let errors = [{value: 0}];
    if(errors[1]) {
        res.json(errors);
    } else {
    Procedure.findById(req.params.id, function(err, procedure) {
        if(err) {
            console.error(err);
        } else {
            let newClient = new Client();
            newClient.name = req.body.inputName;
            newClient.surname = req.body.inputSurname;
            newClient.city = req.body.inputCity;
            newClient.address = req.body.inputAddress;
            newClient.postcode = req.body.inputPostcode;
            newClient.picture = req.file.filename;
            newClient.email = req.body.inputEmail;
            newClient.phoneNumber = req.body.inputPhoneNumber;
            newClient.idProcedure = procedure._id;
            newClient.bodyparts = req.body.bodyparts;

            newClient.save(function(err) {
                if(err) {
                    console.error(err);
                } else {
                    Client.find({idProcedure: procedure._id}, function(err, clients) {
                        let count = 0;
                        for(let i = 0; i< clients.length; i++) {
                            count += clients[i].bodyparts.length;
                        }
                        if(err) {
                            console.error(err);
                        } else {
                            Threshold.findOne({idProcedure: procedure._id}).sort({clientCount: -1}).exec(function (err, falseThreshold) {
                                if(err) {
                                    console.error(err);
                                } else {
                                    Threshold.find({idProcedure: procedure._id, clientCount: {$lte: (count + falseThreshold.clientCount)}}, null, {sort: {clientCount: -1}}, function(err, thresholds) {
                                        if(err) {
                                            console.error(err);
                                        } else {
                                            thresholds.forEach(function (threshold, index){
                                                if(index === 0) {
                                                    Threshold.findByIdAndUpdate(threshold._id, {$set: {isFulfiled: true, isCurrent: true}}, {upsert: true}, function(err, threshold){
                                                        if(err) {
                                                            console.error(err);
                                                        } else {
                                                            console.log("New current threshold");
                                                        }
                                                    });
                                                } else {
                                                    Threshold.findByIdAndUpdate(threshold._id, {$set: {isFulfiled: true, isCurrent: false}}, {upsert: true}, function(err, threshold){
                                                        if(err) {
                                                            console.error(err);
                                                        }
                                                    });
                                                }
                                            });
                                            let success = [{value: 1},{msg: 'Pomyślnie dodano twoje zgłoszenie'}];
                                            res.json(success);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}
});

module.exports = router;