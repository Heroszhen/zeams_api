const router = require('express').Router();
const apiRoutes = require('./api');

router.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, ngsw-bypass');
    // if (req.method === 'OPTIONS') {
    //     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, ngsw-bypass');
    //     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
        
    //     return res.status(200).json({});
    // };
    next(); 
});

router.use('/api', apiRoutes);

module.exports = router;