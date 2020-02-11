import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor() { }

  registerUser(value){
    return new Promise<any>((resolve, reject) => {
      firebase.auth().createUserWithEmailAndPassword(value.email, value.password)
      .then(
        res => {
          var Uid = res.user.uid
          var userInfo = {
            "name" : value.name,
            "lastname" : value.lastName,
            "description" : value.description,
            "email": value.email,
            "photo": 'nill',
            "numbersPost": 0
          }
          firebase.database().ref("/users/").child(Uid).set(userInfo);
          resolve(res)},
        err => reject(err))
    })
   }
  
   loginUser(value){
    return new Promise<any>((resolve, reject) => {
      firebase.auth().signInWithEmailAndPassword(value.email, value.password)
      .then(
        res => resolve(res),
        err => reject(err))
    })
   }
 
   logoutUser(){
     return new Promise((resolve, reject) => {
       if(firebase.auth().currentUser){
         firebase.auth().signOut()
         .then(() => {
           console.log("LOG Out");
           resolve();
         }).catch((error) => {
           reject();
         });
       }
     })
   }
 
   userDetails(){
     return firebase.auth().currentUser;
   }
}
