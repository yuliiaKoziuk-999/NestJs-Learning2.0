import { ConsoleLogger, Injectable } from '@nestjs/common';
import { promises as fsPromises } from 'fs';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class MyLoggerService extends ConsoleLogger {
  private logFilePath = path.join(__dirname, '..', '..', 'logs', 'app.log');

  async logToFile(entry: string) {
    const formattedEntry = `${new Intl.DateTimeFormat('en-US', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'America/Chicago',
    }).format(new Date())}\t${entry}\n`;

    try {
      if (!fs.existsSync(path.join(__dirname, '..', '..', 'logs'))) {
        await fsPromises.mkdir(path.join(__dirname, '..', '..', 'logs'));
      }

      await fsPromises.appendFile(
        path.join(__dirname, '..', '..', 'logs', 'myLogFile.log'),
        formattedEntry,
      );
    } catch (e) {
      if (e instanceof Error)
        console.error('Error writing to log file:', e.message);
    }
  }

  log(message: any, context?: string) {
    const entry = `${context}\t${message}`;
    this.logToFile(entry);
    super.log(message, context);
  }

  error(message: any, stackOrContext?: string) {
    const entry = `${stackOrContext}\t${message}`;
    this.logToFile(entry);

    super.error(message, stackOrContext);
  }
}

