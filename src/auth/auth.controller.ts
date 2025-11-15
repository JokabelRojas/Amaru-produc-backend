// src/auth/auth.controller.ts (actualizado)
import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus, 
  UnauthorizedException,
  Get
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthSinPasswordService } from './auth-sin-password.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginSinPasswordDto } from './dto/login-sin-password.dto';
import { RegisterSinPasswordDto } from './dto/register-sin-password.dto';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authSinPasswordService: AuthSinPasswordService,
  ) {}

  // Endpoints existentes para usuarios con contraseña...
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Iniciar sesión', 
    description: 'Autentica un usuario con email y contraseña' 
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Login exitoso, retorna token de acceso' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Credenciales inválidas' 
  })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return this.authService.login(user);
  }

  @Post('register')
  @ApiOperation({ 
    summary: 'Registrar nuevo administrador', 
    description: 'Crea una nueva cuenta de administrador' 
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Administrador registrado exitosamente' 
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('register-user')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Registrar nuevo usuario normal', 
    description: 'Crea una nueva cuenta de usuario con rol "user"' 
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuario registrado exitosamente' 
  })
  async registerUser(@Body() registerDto: RegisterDto) {
    return this.authService.registerUser(registerDto);
  }

  // Nuevos endpoints para usuarios sin contraseña
  @Post('login-sin-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Iniciar sesión sin contraseña', 
    description: 'Autentica un usuario solo con email (sin contraseña)' 
  })
  @ApiBody({ type: LoginSinPasswordDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Login exitoso, retorna token de acceso' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Usuario no encontrado' 
  })
  async loginSinPassword(@Body() loginDto: LoginSinPasswordDto) {
    const user = await this.authSinPasswordService.validateUser(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    return this.authSinPasswordService.login(user);
  }

  @Post('register-sin-password')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Registrar nuevo usuario sin contraseña', 
    description: 'Crea una nueva cuenta de usuario sin contraseña' 
  })
  @ApiBody({ type: RegisterSinPasswordDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuario registrado exitosamente' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'El usuario ya existe (email o DNI duplicado)' 
  })
  async registerSinPassword(@Body() registerDto: RegisterSinPasswordDto) {
    return this.authSinPasswordService.register(registerDto);
  }

  // Nuevo endpoint para listar usuarios sin contraseña (SIN AUTENTICACIÓN)
  @Get('usuarios-sin-password')
  @ApiOperation({ 
    summary: 'Obtener todos los usuarios sin contraseña', 
    description: 'Retorna una lista completa de todos los usuarios registrados sin contraseña. Endpoint público.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de usuarios sin contraseña obtenida exitosamente' 
  })
  async getUsuariosSinPassword() {
    return this.authSinPasswordService.findAll();
  }

  // Opcional: Endpoint para obtener usuarios activos solamente
  @Get('usuarios-sin-password/activos')
  @ApiOperation({ 
    summary: 'Obtener usuarios sin contraseña activos', 
    description: 'Retorna solo los usuarios sin contraseña que están activos' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de usuarios activos obtenida exitosamente' 
  })
  async getUsuariosSinPasswordActivos() {
    return this.authSinPasswordService.findActivos();
  }
}