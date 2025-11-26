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
  service: 'gmail', 
  auth: {
    user: configService.get('EMAIL_USER'),
    pass: configService.get('EMAIL_PASSWORD'),
  },
},
        defaults: {
          from: `"Amaru Producciones" <${configService.get('EMAIL_USER')}>`,
        },
        logger: true,
        debug: true,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}