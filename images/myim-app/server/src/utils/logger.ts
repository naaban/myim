import winston from 'winston';
import path from 'path';

// Define the path for your log files
const logPath = path.resolve('/var/log/pg');

 

// Create a logger instance
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'pg-management:app' }, // Set the default service name here
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
        filename: path.join(logPath, 'combined.log'),
        format: winston.format.combine(
          winston.format.label({ label: 'pg-management:app' }), // Set the service name here
          winston.format.timestamp(),
          winston.format.printf(({ timestamp, label, level, message }) => {
            message = message instanceof Object ? JSON.stringify(message) : message;
            return `${timestamp} [${label}] ${level}: ${message}`;
          })
        ),
      }),
      new winston.transports.File({
        filename: path.join(logPath, 'error.log'),
        level: 'error',
        format: winston.format.combine(
          winston.format.label({ label: 'pg-management:app' }), // Set the service name here
          winston.format.timestamp(),
          winston.format.printf(({ timestamp, label, level, message }) => {
            message = message instanceof Object ? JSON.stringify(message) : message;
            return `${timestamp} [${label}] ${level}: ${message}`;
          })
        ),
      })
  ],
});


export default logger;
