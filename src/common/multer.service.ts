import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import {
  MulterModuleOptions,
  MulterOptionsFactory,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import environmentConfig from 'src/config/environment.config';

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
  constructor(
    @Inject(environmentConfig.KEY)
    private readonly configService: ConfigType<typeof environmentConfig>,
  ) {}
  createMulterOptions(): MulterModuleOptions {
    const destinationPath =
      this.configService.MULTER_DESTINATION_PATH || 'assets/files';
    const fileSizeLimit =
      this.configService.MULTER_FILE_SIZE_LIMIT || 2 * 1024 * 1024; // Default 2MB
    const filesLimit = this.configService.MULTER_FILES_LIMIT || 1; // Default satu file

    return {
      storage: diskStorage({
        destination: destinationPath,
        filename: (req, file, callback) => {
          const random = Math.round(Math.random() * 1e9);
          const id = req.body.id || random;
          const randomId = `${id}-${random}`;
          const { originalname } = file;
          const filename = `${randomId}-${originalname}`;
          callback(null, filename);
        },
      }),
      fileFilter: (req, file: Express.Multer.File, callback) => {
        // Filter menggunakan regex untuk tipe mimetype yang diizinkan
        const allowedMimeTypes =
          /image\/(jpeg|jpg|png)|application\/(pdf|msword)/;

        if (allowedMimeTypes.test(file.mimetype)) {
          callback(null, true); // File diterima
        } else {
          callback(
            new BadRequestException(
              `Unsupported file type ${extname(file.originalname)}`,
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: fileSizeLimit,
        files: filesLimit,
      },
    };
  }
}
