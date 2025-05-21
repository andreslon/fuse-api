import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller()
export class RootController {
  @Get()
  @ApiExcludeEndpoint()
  redirectToSwagger(@Res() res: Response) {
    return res.redirect('/api');
  }
} 