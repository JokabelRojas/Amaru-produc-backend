import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 465,  // ✅ Puerto SSL
          secure: true,  // ✅ SSL activado
          auth: {
            user: configService.get('EMAIL_USER'),
            pass: configService.get('EMAIL_PASSWORD'),
          },
          // Opciones adicionales para Render
          connectionTimeout: 30000, // 30 segundos
          greetingTimeout: 30000,
          socketTimeout: 30000,
        },
        defaults: {
          from: `"Amaru Producciones" <${configService.get('EMAIL_USER')}>`,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}