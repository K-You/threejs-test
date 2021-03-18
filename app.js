const express = require('express');
const path = require('path');


const app = express();

app.use(express.static(__dirname+'/public'));
app.use('/build/', express.static(path.join(__dirname, 'node_modules/three/build')));
app.use('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')));

app.listen(3000, () => console.log('Running on http://localhost:3000'));