import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginCommand } from '../commands';
import { UserService } from '../services/user.service';
 
import { UnauthorizedException } from '@nestjs/common';
 

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly userService: UserService,
 
  ) {}

  async execute(command: LoginCommand): Promise<any> {
    const { name, email } = command;

    const user = await this.userService.findByUsername(name);
 
    if (!user || email !== user.email) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    return '';
   
  }
}
