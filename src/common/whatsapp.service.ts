
// src/whatsapp/whatsapp.service.ts

import { Injectable, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import makeWASocket, {
  BaileysEventEmitter,
  DisconnectReason,
  useMultiFileAuthState
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class WhatsAppService implements OnModuleInit, OnModuleDestroy {
  private socket!: ReturnType<typeof makeWASocket>;
  private eventEmitter!: BaileysEventEmitter;
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) { }

  async onModuleInit() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');

    this.socket = makeWASocket({
      auth: state,
      printQRInTerminal: true
      // logger: this.logger,
      // logger: require('pino')({ level: 'info' }),
    });

    this.eventEmitter = this.socket.ev;

    this.eventEmitter.on('creds.update', saveCreds);

    this.eventEmitter.on('connection.update', (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        if (shouldReconnect) {
          this.onModuleInit();
        }
      } else if (connection === 'open') {
        console.log('WhatsApp connection opened!');
      }
    });

    this.eventEmitter.on('messages.upsert', (m) => {
      console.log('Received messages:', m);
    });
  }

  onModuleDestroy() {
    if (this.socket) {
      this.socket.logout();
    }
  }

  async sendMessage(to: string, message: string): Promise<void> {
    await this.socket.sendMessage(to, { text: message });
  }
}
