import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connect from './database/conn.js';
import router from './router/route.js';

const app = express();
import bodyParser from 'bodyParser'
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
/** middlewares */
app.use(express.json());
app.use(cors());
app.use(morgan('tiny'));
app.disable('x-powered-by'); // less hackers know about our stack



const port = 5000;

/** HTTP GET Request */
app.get('/', (req, res) => {
    res.status(201).json("Home GET Request");
});


/** api routes */
app.use('/api', router)

/** start server only when we have valid connection */
connect().then(() => {
    try {
        app.listen(port, () => {
            console.log(`Server connected to http://localhost:${port}`);
        })
    } catch (error) {
        console.log('Cannot connect to the server')
    }
}).catch(error => {
    console.log("Invalid database connection...!");
})

const multer = require('multer');

// Set up Multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Set the destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Set the filename to the original name of the uploaded file
  },
});

const upload = multer({ storage: storage });

async function register(req, res) {
  const data = req.body.userData;

  const hashedPassword = await bcrypt.hash(data.password, 10);
  var table = null;

  if (data.user_type == "Passenger") {
    table = "fastmove.passenger";
  } else if (data.user_type == "bus owner") {
    table = "fastmove.busowner";
  }else if (data.user_type == "conductor") {
    table = "fastmove.conductor";
  }

  const user_register_sql = `INSERT INTO ${table} (Email, FName, LName, Password, Image) VALUES (?, ?, ?, ?, ?)`;

  const values = [data.email, data.fname, data.lname, hashedPassword, req.file.path];

  try {
    connection.query(user_register_sql, values, function (err, result, fields) {
      if (err) {
        console.log(err);
        return res.status(500).send(err);
      } else {
        return res.status(201).send("User registered successfully.");
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error });
  }
}

// Handle the file upload route
app.post('/upload', upload.single('image'), register);