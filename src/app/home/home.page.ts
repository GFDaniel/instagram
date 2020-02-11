import { Component, OnInit } from '@angular/core';
import { NavController, ModalController } from '@ionic/angular';
import { AuthenticationService } from '../services/authentication.service';
import { Platform } from '@ionic/angular';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { File } from '@ionic-native/file/ngx';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import * as firebase from 'firebase';
import { GlobalServiceService } from '../services/global-service.service';
import { PostServiceService } from '../post-service.service';

import 'firebase/auth';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  public uploadPercent: Observable<number>;
  public downloadUrl: Observable<string>;
  public userEmail: string;
  public name: string;
  public lastname: string;
  public description: string;
  public photo: string;
  public arrPost: any = [];

  constructor(platform: Platform, androidPermissions: AndroidPermissions,
    private camera:Camera, private file:File, private angularFireStorage:AngularFireStorage,
    private navCtrl: NavController, private authService: AuthenticationService,
    public global:GlobalServiceService, private postService: PostServiceService ) {
    platform.ready().then(() => {
      androidPermissions.requestPermissions(
        [
          androidPermissions.PERMISSION.CAMERA, 
          androidPermissions.PERMISSION.CALL_PHONE, 
          androidPermissions.PERMISSION.GET_ACCOUNTS, 
          androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE, 
          androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE
        ]
      );
    }) 
  }

  async ngOnInit(){
    
    if(this.authService.userDetails()){
      this.arrPost = await this.postService.getPostArr()
      this.userEmail = this.authService.userDetails().email;
      firebase.database().ref("/users/"+firebase.auth().currentUser.uid).once("value").then((snap)=>{
        this.name=snap.child("name").val()
        this.lastname=snap.child("lastname").val()
        this.description=snap.child("description").val()

        if (snap.child("photo").val()=='nill') {
          this.downloadUrl = this.angularFireStorage.ref('profile2.jpg').getDownloadURL()
          this.photo = "null"
        }else{
          this.downloadUrl = this.angularFireStorage.ref(firebase.auth().currentUser.uid+'profile.jpg').getDownloadURL()
          this.photo = "nill"
        }
        this.global.setInfoPhoto(this.name, this.lastname, this.userEmail, this.description, this.photo )
      })
      
    }else{
      this.navCtrl.navigateBack('/login');
    }
  }

  async getPost(){
    this.arrPost = this.postService.getPostArr()
  }

  async openGalery(){
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      correctOrientation: true
    };

    try{
      const fileUri: string = await this.camera.getPicture(options);
      let file: string;

      file = fileUri.substring(fileUri.lastIndexOf('/')+1, fileUri.indexOf('?'));
      const path: string = fileUri.substring(0, fileUri.lastIndexOf('/'));

      const buffer: ArrayBuffer = await this.file.readAsArrayBuffer(path, file);
      const blob: Blob = new Blob([buffer], {type: 'image/jpeg' });

      this.uploadPicture(blob);
    } catch(error) {
      console.error(error);
    }
  }

  uploadPicture(blob: Blob){
    const ref = this.angularFireStorage.ref('ionic.jpg');
    const task = ref.put(blob);
    
    this.uploadPercent = task.percentageChanges();
    task.snapshotChanges().pipe(
      finalize(() => this.downloadUrl = ref.getDownloadURL())
    ).subscribe();
  }

  addPost(){
    this.navCtrl.navigateRoot('/add-post');
  }
  
  editProfile(){
    this.navCtrl.navigateRoot('/edit-profile');
  }

  logout(){
    this.authService.logoutUser()
    .then(res => {
      this.navCtrl.navigateRoot('/login');
    })
    .catch(error => {
      this.navCtrl.navigateRoot('/login');
    })
  }

}
