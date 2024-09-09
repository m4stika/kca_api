
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
import pino from 'pino';

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
      printQRInTerminal: true,
      qrTimeout: 120000, // 2 minute
      logger: pino({ level: "silent" })
      // logger: pino({ level: "info" })
      // logger: require('pino')({ level: 'silent' }),
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
        this.logger.info('WhatsApp connection opened!');
      }
    });

    this.eventEmitter.on('messages.upsert', (m) => {
      const msg = m.messages[0];

      // Cek apakah pesan berasal dari grup atau tidak
      // const isGroup = msg.key.remoteJid?.endsWith('@g.us') || msg.key.remoteJid?.endsWith("@broadcast");
      const isPersonal = msg.key.remoteJid?.endsWith("@s.whatsapp.net")
      const from = msg.key.remoteJid?.slice(0, msg.key.remoteJid.indexOf("@"))

      if (isPersonal && !msg.key.fromMe) {
        // if (isPersonal) {
        // Hanya log pesan yang berasal dari percakapan pribadi
        this.logger.info(`New message from ${from}: ${msg.message?.conversation}`);
        // this.logger.info(`Received messages: ${JSON.stringify(m.messages, undefined, 3)}`);
      }
    });
  }

  onModuleDestroy() {
    if (this.socket) {
      this.socket.logout();
    }
  }

  async sendMessage(to: string, message: string): Promise<void> {
    const isValidNumber = await this.checkPhoneNumber(to)
    if (!isValidNumber) {
      this.logger.error(`Cannot send message. The number ${to} is not valid.`)
      return
    }
    const toRegex = to.replace(/\D/g, "")
    const providerId = '@s.whatsapp.net'
    const defaultTo = toRegex.startsWith("0")
      ? `62${toRegex.slice(1)}` : toRegex.startsWith("+62") ? toRegex.slice(1) : toRegex

    await this.socket.sendMessage(`${defaultTo}${providerId}`, { text: message });
  }

  async checkPhoneNumber(phoneNumber: string): Promise<boolean> {
    try {
      const result = await this.socket.onWhatsApp(phoneNumber);

      if (result && result.length > 0) {
        this.logger.info(`Number ${phoneNumber} is valid on WhatsApp.`);
        return true;
      } else {
        this.logger.warn(`Number ${phoneNumber} is not registered on WhatsApp.`);
        return false;
      }
    } catch (error) {
      this.logger.error(`Failed to check number ${phoneNumber}: ${(error as Error).message}`);
      return false;
    }
  }
}
