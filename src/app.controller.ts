import { Controller, All, NotFoundException } from '@nestjs/common';

@Controller()
export class AppController {
  @All('*')
  catchAll() {
    throw new NotFoundException();
  }
}
