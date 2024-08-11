require('dotenv').config();
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { EcommerceServer } = require('./utils/emcommerce-server');
const server = EcommerceServer.getInstance();
const app = server.app;
const io = server.io;
const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 8080;
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const logger = require('morgan');
const cors = require('cors');
const fs = require('fs');
const { log } = require('./util');
const {
  productRoutes,
  authRoutes,
  cartRoutes,
  orderRoutes,
  adminRoutes,
  chatRoutes,
} = require('./routes');

// Tin tưởng các proxy

app.set('trust proxy', true);
// Cấu hình express-rate-limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5000, // giới hạn mỗi IP 100 yêu cầu mỗi 15 phút
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

if (process.env.NODE_ENV === 'production') {
  app.use(limiter);
  app.use(
    logger('common', {
      stream: fs.createWriteStream('./access.log', { flags: 'a' }),
    }),
  );
} else {
  app.use(logger('dev'));
}

const corsOptions = {
  origin: [process.env.CLIENT_URL, process.env.ADMIN_URL], // Replace with your allowed origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Configure Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

app.use(compression());
// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json

app.use('/images', express.static(path.join(__dirname, 'images')));
app.set('view engine', 'ejs');
app.set('views', 'views');

app.io = io;
app.set('socketio', io);

app.use('/products', productRoutes);
app.use('/auth', authRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/admin', adminRoutes);
app.use('/chat', chatRoutes);

// middleware error handling
app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  if (data && status == 403) {
    return res.status(status).json({ ...data });
  }

  if (data && status == 404) {
    return res.status(status).json(data);
  }
  res.status(status).json({ message: message });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then((result) => {
    server.httpServer.listen(port, hostname, () => {
      if (hostname) {
        log.info('server', `Listening on ${hostname}:${port}`);
      } else {
        log.info('server', `Listening on ${port}`);
      }
    });
    io.use((socket, next) => {
      const roomId = socket.handshake.query.roomId;
      const isAdmin = socket.handshake.query.isAdmin;
      if (roomId) {
        next();
      } else if (isAdmin) {
        next();
      } else {
        const error = new Error('Not found room id');
        error.status = 401;
        next(error);
      }
    }).on('connection', (socket) => {
      const query = socket.handshake.query;

      if (query.roomId) {
        socket.join(query.roomId);
      }

      if (query.isAdmin) {
        socket.on('join', (data) => {
          socket.join('admin');
        });
      }
    });
  })
  .catch((err) => console.log(err));
