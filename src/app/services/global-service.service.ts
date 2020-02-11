import { Injectable } from '@angular/core';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class GlobalServiceService {

  private name : any;
  private lastname : any;
  private email : any;
  private description : any;
  private photo : any;

  constructor() { }

  public setInfo(name, lastname, email, description){
    this.name = name;
    this.lastname = lastname;
    this.email = email;
    this.description = description;
  }

  public setInfoPhoto(name, lastname, email, description, photo){
    this.name = name;
    this.lastname = lastname;
    this.email = email;
    this.description = description;
    this.photo = photo;
  }

  public getPhoto(){
    return this.photo
  }
  
  public getInfoName(){
    return this.name
  }

  public getInfoLastname(){
    return this.lastname
  }

  public getInfoEmail(){
    return this.email
  }

  public getInfoDescription(){
    return this.description
  }
}
