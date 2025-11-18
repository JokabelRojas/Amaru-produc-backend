import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  message: string;
  success: boolean;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    // Mensajes por defecto según el método HTTP
    const defaultMessages = {
      POST: 'Creado exitosamente',
      GET: 'Obtenido exitosamente',
      PUT: 'Actualizado exitosamente',
      PATCH: 'Actualizado exitosamente',
      DELETE: 'Eliminado exitosamente',
    };

    return next.handle().pipe(
      map(data => {
        // Si ya es una respuesta formateada, no hacer nada
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Determinar el mensaje basado en el método HTTP
        let message = defaultMessages[request.method] || 'Operación exitosa';
        
        // Mensajes específicos para endpoints personalizados
        if (request.method === 'PUT' || request.method === 'PATCH') {
          if (request.url.includes('/activar')) {
            message = 'Activado exitosamente';
          } else if (request.url.includes('/desactivar')) {
            message = 'Desactivado exitosamente';
          } else if (request.url.includes('/estado')) {
            message = 'Estado cambiado exitosamente';
          }
        }

        return {
          data,
          message,
          success: true,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}