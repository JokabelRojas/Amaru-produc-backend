import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailerService: MailerService) {}


  async enviarEmailInscripcionCreada(email: string, estado: string, idInscripcion: string) {
    try {
      this.logger.log(`📧 Intentando enviar email a: ${email}`);
      this.logger.log(`🔧 Config - User: ${process.env.EMAIL_USER ? '✅' : '❌'}`);
      this.logger.log(`🔧 Config - Pass: ${process.env.EMAIL_PASSWORD ? '✅' : '❌'}`);

      const result = await this.mailerService.sendMail({
        to: email,
        subject: 'Seguimiento de Inscripción - Amaru Producciones',
        html: this.getTemplateInscripcionCreada(estado, idInscripcion),
      });

      this.logger.log(`✅ Email enviado exitosamente a: ${email}`);
      this.logger.log(`📨 Message ID: ${result.messageId}`);
      this.logger.log(`📊 Response: ${result.response}`);
      
      return true;
    } catch (error) {
      this.logger.error(`❌ Error CRÍTICO enviando email:`);
      this.logger.error(`📧 Destino: ${email}`);
      this.logger.error(`🔧 Error: ${error.message}`);
      this.logger.error(`🔍 Stack: ${error.stack}`);
      
      // Error específico de autenticación
      if (error.code === 'EAUTH') {
        this.logger.error('❌ Error de autenticación - Verifica EMAIL_USER y EMAIL_PASSWORD');
      }
      
      return false;
    }
  }

  async enviarEmailEstadoActualizado(email: string, estado: string, idInscripcion: string) {
    try {
      this.logger.log(`Intentando enviar email de actualización a: ${email}`);
      
      const result = await this.mailerService.sendMail({
        to: email,
        subject: `Actualización de Estado - Inscripción ${estado.toUpperCase()}`,
        html: this.getTemplateEstadoActualizado(estado, idInscripcion),
      });

      this.logger.log(`✅ Email de actualización enviado a: ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Error enviando email de actualización a ${email}:`, error);
      return false;
    }
  }

  private getTemplateInscripcionCreada(estado: string, idInscripcion: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .btn { display: inline-block; padding: 10px 20px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; }
          .estado { padding: 10px; background: #f39c12; color: white; text-align: center; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Amaru Producciones</h1>
          </div>
          <div class="content">
            <h2>¡Bienvenido amigo!</h2>
            <p>Gracias por tu inscripción. Tu solicitud ha sido recibida exitosamente.</p>
            
            <div class="estado">
              <strong>Estado actual de tu inscripción:</strong> ${estado.toUpperCase()}
            </div>
            
            <p>En breve se actualizará el estado de tu inscripción.</p>
            
            <p><strong>Importante:</strong> Asegúrate de haber enviado tu pago al número: <strong>51959194292</strong></p>
            
            <p style="text-align: center;">
              <a href="https://wa.me/51959194292?text=Hola,%20quiero%20enviar%20mi%20comprobante%20de%20pago%20para%20la%20inscripción%20${idInscripcion}" 
                 class="btn" target="_blank">
                📱 Click aquí para enviar tu comprobante de pago
              </a>
            </p>
          </div>
          <div class="footer">
            <p>© 2024 Amaru Producciones. Todos los derechos reservados.</p>
            <p>ID de inscripción: ${idInscripcion}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getTemplateEstadoActualizado(estado: string, idInscripcion: string): string {
    const estadoTexto = estado === 'aprobado' ? 'APROBADA' : 'RECHAZADA';
    const colorEstado = estado === 'aprobado' ? '#27ae60' : '#e74c3c';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .estado { padding: 15px; background: ${colorEstado}; color: white; text-align: center; border-radius: 5px; font-size: 18px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Amaru Producciones</h1>
          </div>
          <div class="content">
            <h2>Actualización de tu Inscripción</h2>
            <p>El estado de tu inscripción ha sido actualizado:</p>
            
            <div class="estado">
              <strong>NUEVO ESTADO: ${estadoTexto}</strong>
            </div>
            
            ${estado === 'aprobado' ? 
              '<p>¡Felicidades! Tu inscripción ha sido aprobada. Te contactaremos pronto con más información.</p>' :
              '<p>Lamentablemente tu inscripción no ha sido aprobada. Si crees que hay un error, por favor contáctanos.</p>'
            }
          </div>
          <div class="footer">
            <p>© 2024 Amaru Producciones. Todos los derechos reservados.</p>
            <p>ID de inscripción: ${idInscripcion}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}