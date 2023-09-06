import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { JwtPayload } from './jwt-payload-interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'topSecret51',
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { username } = payload;
    const user = await this.userRepository.findOneBy({ username });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
