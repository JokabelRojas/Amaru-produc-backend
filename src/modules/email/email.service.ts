import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async enviarEmailInscripcionCreada(email: string, estado: string, idInscripcion: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Seguimiento de Inscripción - Amaru Producciones',
        template: 'inscripcion-creada', // O usar html directamente
        context: {
          email,
          estado,
          idInscripcion,
          numeroPago: '51959194292'
        },
        html: `
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
                
                <p>Si ya realizaste el pago, por favor envía tu comprobante por WhatsApp para acelerar el proceso.</p>
              </div>
              <div class="footer">
                <p>© 2024 Amaru Producciones. Todos los derechos reservados.</p>
                <p>ID de inscripción: ${idInscripcion}</p>
              </div>
            </div>
          </body>
          </html>
        `
      });
      console.log(`Email enviado exitosamente a: ${email}`);
    } catch (error) {
      console.error('Error enviando email:', error);
      // No lanzamos error para no interrumpir el flujo principal
    }
  }

  async enviarEmailEstadoActualizado(email: string, estado: string, idInscripcion: string) {
    const estadoTexto = estado === 'aprobado' ? 'APROBADA' : 'RECHAZADA';
    const colorEstado = estado === 'aprobado' ? '#27ae60' : '#e74c3c';
    
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: `Actualización de Estado - Inscripción ${estadoTexto}`,
        html: `
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
                
                <p>Para cualquier consulta, no dudes en contactarnos.</p>
              </div>
              <div class="footer">
                <p>© 2024 Amaru Producciones. Todos los derechos reservados.</p>
                <p>ID de inscripción: ${idInscripcion}</p>
              </div>
            </div>
          </body>
          </html>
        `
      });
      console.log(`Email de actualización enviado a: ${email}`);
    } catch (error) {
      console.error('Error enviando email de actualización:', error);
    }
  }
}