import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import { AngularFireStorage } from '@angular/fire/storage';
import { async } from '@angular/core/testing';

@Injectable({
  providedIn: 'root'
})

export class PostServiceService {

  constructor( public angularFireStorage: AngularFireStorage) { }

  
  public postNumbers: number = 0
  public arrayPost: any = []
  public url: string = ""

   async getAllPost() {
    await firebase.database().ref("/users/"+firebase.auth().currentUser.uid).once("value").then((snap)=>{
      this.postNumbers = snap.child("numbersPost").val()-1
    });

    for (let index = this.postNumbers; index >= 0; index--) {
      this.getPost(index)
    }

  }

  async getImg(number){
    const downloadURL = await this.angularFireStorage.ref(firebase.auth().currentUser.uid+'/'+number+'/'+'post.jpg').getDownloadURL()
    await downloadURL.subscribe( async (url) => { 
      firebase.database().ref("/users/"+firebase.auth().currentUser.uid+"/post/"+number).update({ url:url });
    })
    
  }

  async getPost(number){
    await this.getImg(number)
    await firebase.database().ref("/users/"+firebase.auth().currentUser.uid+"/post/"+number).once("value").then(async (snap)=>{
      this.arrayPost.push({ number: number, description: snap.child("description").val(), url: snap.child("url").val() })
    });
  }

  async getPostArr(){
    await this.getAllPost()
    console.log(this.arrayPost);
    return this.arrayPost
  }
}
