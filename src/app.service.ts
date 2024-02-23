import { HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { Character, Location } from './types/character.interface';

@Injectable()
export class AppService {

  // LocalStorage para los personajes 
  private characters: Character[] = [];

  // Obtener y restablecer los personajes de "rickandmorty.com"
  async createPopulation() {
    // Se reinician los personajes 
    this.characters = [];
    try {
      // Se obtienen los personajes del api 
      const response = await axios.get('https://rickandmortyapi.com/api/character');
      // Se retorna un error si no se reciben los personajes 
      if(!response) {
        throw new HttpException('no se obtuvieron los personajes de "rickandmorty.com"!',HttpStatus.FAILED_DEPENDENCY);
      }
      // Se agregan los personajes recibidos por el api a nuestro arreglo de personajes 
      response.data.results.map((character: Character) => this.characters.push(character));
      // Se retorna un mensaje de éxito 
      return 'personajes obtenidos!';
    } catch (error) {
      throw new InternalServerErrorException(error.response);
    }
  }

  // Obtener los personajes del almacenamiento local
  getCharacters(): Character[] {
    try {
      // Se retorna un error si no hay personajes guardados 
      if(this.characters.length == 0) throw new NotFoundException('no hay personajes!');
      // Se retornan los personajes 
      return this.characters;
    } catch (error) {
      throw new InternalServerErrorException(error.response);
    }
  }

  // Agregar personaje nuevo 
  createCharacter(character: Character) {
    // Se buscan los campos faltantes para el nuevo personaje 
    const handleErrors: string[] = this.errorFields(character);
    // Se muestran los errores a existir 
    if(handleErrors.length > 0) throw new HttpException(handleErrors, HttpStatus.BAD_REQUEST);
    // Se asegura de que el id recibido no exista en otro personaje 
    if(this.idAlreadyExist(character.id)) throw new HttpException('id duplicado!', HttpStatus.CONFLICT);
    // Se guarda el nuevo personaje 
    this.characters.push(character);
    // Se retorna un mensaje d éxito 
    return 'personaje creado!'
  }
  
  // Actualizamos un personaje 
  updateCharacter(id_user: number, updatedData: any){
    // Se busca el personaje 
    const character: Character = this.characters.find((character: Character) => character.id == id_user);
    // Se retorna un error si no existe tal personaje 
    if(!character) throw new NotFoundException('personaje no encontrado!');
    // Se obtiene el index del personaje a actualizar 
    const index: number =  this.characters.indexOf(character);
    // Se crear los campos que probablemente vengan en la información actualizada
    const fields: string[] = ['name','status','species','type','gender','origin','location','image','episode','url','created'];
    // Se mapean los campos 
    fields.map((field: string) => {
      // Se retorna un error si viene el campo id, ya que jno se permite su modificación
      if('id' in updatedData) throw new HttpException('no se permite actualizar el id de un personaje!', HttpStatus.UNAUTHORIZED);
      // Se busca que el campo ORIGIN contenga todos sus propiedades 
      if(field == 'origin' && field in updatedData && !(updatedData.origin instanceof Object && 'name' in updatedData.origin && 'url' in updatedData.origin))
        throw new HttpException('El campo "origin" debe contener los siguientes campos: {name: string, url: string}', HttpStatus.BAD_REQUEST);
      // Se busca que el campo LOCATION contenga todas sus propiedades 
      if(field == 'location' && field in updatedData && !(updatedData.location instanceof Object && 'name' in updatedData.location && 'url' in updatedData.location))
        throw new HttpException('El campo "location" debe contener los siguientes campos: {name: string, url: string}', HttpStatus.BAD_REQUEST);
      // Se actualiza el campo del personaje con la nueva información 
      if(field in updatedData) this.characters[index][field] = updatedData[field];
    });
    // Se retorna el mensaje de éxito  
    return 'personaje actualizado!';
  }

  deleteCharacter(id_user: number){
    // Se busca el personaje 
    const character: Character = this.characters.find((character: Character) => character.id == id_user);
    // Se retorna un error si no existe tal personaje 
    if(!character) throw new NotFoundException('personaje no encontrado!');
    // Se elimina el personaje desactualizado
    this.characters.splice(this.characters.indexOf(character), 1);
    // Se retorna el mensaje de éxito  
    return 'personaje eliminado!';
  }

  // Se busca que el id no se repita 
  idAlreadyExist(id: number): boolean{
    // Se busca si el id se encuentra ya registrado
    const character: Character = this.characters.find((character: Character) => character.id == id);
    // Re retorna un TRUE si existe un personaje 
    return (character)? true : false;
  }

  // Buscar campos faltantes para el nuevo personaje
  errorFields(character: Character): string[]{
    // Campos necesarios 
    const fields: string[] = ['id','name','status','species','type','gender','origin','location','image','episode','url','created'];
    // Errores encontrados 
    let errors  : string[] = [];
    // Se buscan los campos faltantes 
    fields.map((field: string) => { 
      // Se agregan los campos faltantes como errores 
      if(!(field in character)) errors.push('Es necesario el siguiente campo: '+field);
      // Se busca que el campo ORIGIN contenga todos sus propiedades 
      if(field == 'origin' && !(character.origin instanceof Object && 'name' in character.origin && 'url' in character.origin))
        errors.push('El campo "origin" debe contener los siguientes campos: {name: string, url: string}');
      // Se busca que el campo LOCATION contenga todas sus propiedades 
      if(field == 'location' && !(character.location instanceof Object && 'name' in character.location && 'url' in character.location))
        errors.push('El campo "location" debe contener los siguientes campos: {name: string, url: string}');
    });
    // Se regresan los errores a existir 
    return errors;
  }

}