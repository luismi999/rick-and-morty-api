import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/population')
  createPopulation() {
    return this.appService.createPopulation();
  }

  @Get('/characters')
  getCharacters() {
    return this.appService.getCharacters();
  }

  @Post('/create')
  createCharacters(@Body() newCharacter: any) {
    return this.appService.createCharacter(newCharacter);
  }

  @Patch('/update/:id')
  updateCharacter(@Param('id') id: string, @Body() updatedData: any) {
    return this.appService.updateCharacter(+id, updatedData);
  }

  @Delete('/delete/:id')
  deleteCharacter(@Param('id') id: string){
    return this.appService.deleteCharacter(+id);
  }

}
