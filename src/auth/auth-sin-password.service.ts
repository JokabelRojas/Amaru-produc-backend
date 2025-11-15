// src/auth/auth-sin-password.service.ts
import { 
  Injectable, 
  UnauthorizedException, 
  InternalServerErrorException,
  NotFoundException 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Rol } from 'src/entities/rol.entity';
import { UsuarioSinPassword } from 'src/entities/usuario-sin-password.entity';

@Injectable()
export class AuthSinPasswordService {
  constructor(
    @InjectModel(UsuarioSinPassword.name) 
    private usuarioSinPasswordModel: Model<UsuarioSinPassword>,
    @InjectModel(Rol.name) 
    private rolModel: Model<Rol>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string): Promise<any> {
    const user = await this.usuarioSinPasswordModel
      .findOne({ email })
      .populate('id_rol')
      .exec();
    
    if (!user) {
      return null;
    }
    
    return user.toObject();
  }

  async login(user: any) {
    const payload = {
      email: user.email, 
      sub: user._id.toString(),
      rol: user.id_rol,
      tipo: 'sin_password'
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {  
        id: user._id.toString(), 
        nombre: user.nombre,
        apellido: user.apellido,
        dni: user.dni,
        email: user.email,
        telefono: user.telefono,
        direccion: user.direccion,
        rol: user.id_rol,
        tipo: 'sin_password',
        activo: user.activo,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    };
  }

  async register(createUserDto: any) {
    // Verificar si el email ya existe
    const existingUser = await this.usuarioSinPasswordModel.findOne({ 
      email: createUserDto.email 
    });
    if (existingUser) {
      throw new UnauthorizedException('El usuario ya existe');
    }

    // Verificar si el DNI ya existe
    const existingUserByDni = await this.usuarioSinPasswordModel.findOne({ 
      dni: createUserDto.dni 
    });
    if (existingUserByDni) {
      throw new UnauthorizedException('El DNI ya está registrado');
    }
    
    // Buscar el rol "user"
    const userRole = await this.rolModel.findOne({ nombre: 'user' });
    if (!userRole) {
      throw new UnauthorizedException('Rol user no encontrado');
    }
    
    // Crear el nuevo usuario sin contraseña
    const userData = {
      ...createUserDto,
      id_rol: userRole._id
    };
    
    const user = await this.usuarioSinPasswordModel.create(userData);
    
    // Hacer populate para obtener todos los datos del rol
    const userWithPopulate = await this.usuarioSinPasswordModel
      .findById(user._id)
      .populate('id_rol')
      .exec();
    
    if (!userWithPopulate) {
      throw new InternalServerErrorException('Error al crear el usuario');
    }
    
    const result = userWithPopulate.toObject() as any;
    return {
      id: result._id.toString(),
      nombre: result.nombre,
      apellido: result.apellido,
      dni: result.dni,
      email: result.email,
      telefono: result.telefono,
      direccion: result.direccion,
      rol: result.id_rol,
      activo: result.activo,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    };
  }

  // Método para obtener todos los usuarios sin contraseña
  async findAll(): Promise<any[]> {
    const usuarios = await this.usuarioSinPasswordModel
      .find()
      .populate('id_rol')
      .sort({ createdAt: -1 })
      .exec();

    return usuarios.map(usuario => {
      const userObj = usuario.toObject() as any;
      return {
        id: userObj._id.toString(),
        nombre: userObj.nombre,
        apellido: userObj.apellido,
        dni: userObj.dni,
        email: userObj.email,
        telefono: userObj.telefono,
        direccion: userObj.direccion,
        rol: userObj.id_rol,
        activo: userObj.activo,
        createdAt: userObj.createdAt,
        updatedAt: userObj.updatedAt
      };
    });
  }

  // Método para obtener solo usuarios activos
  async findActivos(): Promise<any[]> {
    const usuarios = await this.usuarioSinPasswordModel
      .find({ activo: true })
      .populate('id_rol')
      .sort({ createdAt: -1 })
      .exec();

    return usuarios.map(usuario => {
      const userObj = usuario.toObject() as any;
      return {
        id: userObj._id.toString(),
        nombre: userObj.nombre,
        apellido: userObj.apellido,
        dni: userObj.dni,
        email: userObj.email,
        telefono: userObj.telefono,
        direccion: userObj.direccion,
        rol: userObj.id_rol,
        activo: userObj.activo,
        createdAt: userObj.createdAt,
        updatedAt: userObj.updatedAt
      };
    });
  }

  // Método adicional para buscar usuario por ID
  async findById(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('ID de usuario no válido');
    }

    const usuario = await this.usuarioSinPasswordModel
      .findById(id)
      .populate('id_rol')
      .exec();

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const userObj = usuario.toObject() as any;
    return {
      id: userObj._id.toString(),
      nombre: userObj.nombre,
      apellido: userObj.apellido,
      dni: userObj.dni,
      email: userObj.email,
      telefono: userObj.telefono,
      direccion: userObj.direccion,
      rol: userObj.id_rol,
      activo: userObj.activo,
      createdAt: userObj.createdAt,
      updatedAt: userObj.updatedAt
    };
  }
}